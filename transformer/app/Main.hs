{-# LANGUAGE OverloadedStrings #-}

module Main where

import           Control.Exception
import           Control.Monad
import           Data.List         (intercalate, nub)
import           Data.Map          (Map)
import qualified Data.Map          as Map
import           Data.Text.Lazy    (Text)
import qualified Data.Text.Lazy    as Txt
import qualified Data.Text.Lazy.IO as LazyTxtIO
import           Eval
import           Parse
import           System.Exit
import           Text.Parsec       (parse)

debug = False -- turn on to display the parse!

untabs = intercalate "\t"
inList = flip elem

-- inspiration from example 9 http://book.realworldhaskell.org/read/using-parsec.html
main = do
  conts <- LazyTxtIO.getContents -- getContents for a file?
  let c = filter (not . Txt.null) (Txt.split (inList ['\n', '\r']) conts) -- split on every newline character and then remove the blank lines (works with Linux, Mac, Windows styles!)
  when (null c) (complain "Error: Input is blank..." 1)
  -- This should really be addressed by limiting the total size of web requests.
  when ((Txt.length $ head c) >= 30000) (complain "Error: Transformation text is too long... Please report this error if you have a legitimate use case." 1)
  case parse mainparser "" (Txt.unpack $ head c) of
    Left e -> complain ("Error parsing input: " ++ show e) 1
    Right ast -> do
      when debug $ print ast
      -- TODO Are these reasonable numbers? If data gets bigger, we might need to change them
      when (count ast >= 300) (complain "Error: Transformation is too intensive (too many decision points)! Please report this error if you have a legitimate use case." 1)
      when (null $ tail c) (exitWith ExitSuccess)
      let names = words (Txt.unpack $ head $ tail c) -- 2nd line

      -- NOTE: At this point, if we have an error, it means something is seriously wrong with the input. (from Dataverse, or wherever)
      when (names /= nub names) (complain "Error: You've provided a variable more than once!" 2)

      case compliesVars ast names of
        Left errormsg -> complain ("Bad provided vars: " ++ errormsg) 2
        Right namesToShow -> do
          let rows = map (Txt.splitOn "\t") (tail $ tail c) -- 3rd+ lines, ignoring blanks

          -- Tip: Comment this check to get a more interactive experience when testing, and possibly faster performance.
          -- However, it's more solid against timing attacks this way, because it verifies the whole database "before" starting to process.
          -- (it'll be able to answer you right after you type each individual line in, instead of waiting for EOF)
          let badInput = any ((/= length names) . length) rows
          when badInput (complain "Error: Incorrect number of variables in one of the columns!" 2)

          putStrLn $ untabs namesToShow -- The variables that we will output (also functions as header for reading as data frame)

          let fallbackString = untabs (replicate (length namesToShow) "NA") -- If there's somehow an exception, make the whole row NA
          sequence_ $ map (\row -> catcher fallbackString (evalRow ast names row namesToShow)) rows
          exitWith ExitSuccess

complain :: String -> Int -> IO ()
complain s i = do {putStrLn s; exitWith $ ExitFailure i}

catcher :: String -> IO () -> IO ()
catcher str i = catch i (silentFail str)

silentFail :: String -> SomeException -> IO ()
silentFail str _ = do {putStrLn str ; return ()}

evalRow :: Stmt -> [String] -> [Text] -> [String] -> IO ()
evalRow ast names values namesToShow =
  let inserter (n, Just v) m  = Map.insert n v m
      inserter (_, Nothing) m = m
      m = foldr inserter Map.empty (zip names (map readVal values))
  in showResults namesToShow (evalStmt ast m) -- catch here

showResults :: [String] -> Map String Val -> IO ()
showResults names m = putStrLn $ untabs (map (rShow . flip Map.lookup m) names)

rShow :: Result -> String
rShow (Just (Nval n)) = show (show n) -- We want to quote everything in the end, I think?
rShow (Just (Bval n)) = if n then show "TRUE" else show "FALSE" -- repeated code from R.hs...
rShow (Just (Sval n)) = show (Txt.filter (not . (inList ['\n', '\r', '\t'])) n)
rShow (Nothing)       = "NA" -- we don't quote these though.

readVal :: Text -> Result
readVal x =
  let st = Txt.strip x
  in  case Txt.stripPrefix "\"" st >>= Txt.stripSuffix "\"" of
        Just v  -> canonicalWithNAs v -- read quoted string
        Nothing -> canonicalWithNAs st -- read unquoted string

-- We just want the NA conversion to happen at the start, then we're good.
canonicalWithNAs :: Text -> Result
canonicalWithNAs x
  | x `elem` ["NA", "Na", "na", ""] = Nothing
  | otherwise = canonical x

-- TODO. To prevent type inference misunderstandings, we'll just have to change the definition of == (others maybe?), and make canonicalWithNAs consider any type annotations they provide.
