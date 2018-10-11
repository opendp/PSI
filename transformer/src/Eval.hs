{-# LANGUAGE OverloadedStrings #-}
-- TODO Make sure to compile it with warnings for incomplete patterns!

module Eval where
import           Control.Monad
import           Data.List            (nub)
-- Data.Map.Lazy or .Strict?
import           Data.Map             (Map)
import qualified Data.Map             as Map
import           Data.Maybe
import           Data.Text.Lazy       (Text)
import qualified Data.Text.Lazy       as Txt
import qualified Text.Read            as Read

data Stmt = Assign String Expr | Seq [Stmt]                                deriving Show
data Expr = Literal Val | Var String | Uno Unop Expr
            | Duo Duop Expr Expr | Trio Triop Expr Expr Expr               deriving Show
data Unop = Negate | Log | Not | Exp | Sqrt | IsNa | AsNum | AsLog | AsCat deriving Show
data Duop = Add | Sub | Mul | Div | And | Or | Pow | Logbase
            | Less | Greater | LessEq | GreaterEq | Eq                     deriving Show
data Val = Sval Text | Nval Double | Bval Bool                             deriving (Show, Eq)
data Triop = Ifelse                                                        deriving Show

-- Nothing represents a NA value.
type Result = Maybe Val

trueStrings = ["T", "TRUE", "True", "true"]
falseStrings = ["F", "FALSE", "False", "false"]

eval :: Expr -> Map String Val -> Result
evalStmt :: Stmt -> Map String Val -> Map String Val

class AST a where
  compliesVars :: a -> [String] -> Either String [String]
  count :: a -> Int
  -- These could be combined into one if someone wants to refactor.

instance AST Stmt where
  compliesVars (Seq []) vars = return vars
  compliesVars (Seq (x:xs)) vars = compliesVars x vars >>= compliesVars (Seq xs)
  -- If you don't want to have reassignments, uncomment the below:
  compliesVars (Assign s e) vars = -- if s `elem` vars
                                   -- then Left "Can't assign to a variable more than once."
                                   {- else -} do { xs <- compliesVars e vars
                                                 ; return (if s `elem` xs then xs else (s:xs)) } -- nub is overkill
  count (Seq []) = 0
  count (Seq (x:xs)) = count x + count (Seq xs)
  count (Assign s e) = 1 + count e

instance AST Expr where
  compliesVars (Literal _) vars = return vars
  compliesVars (Var s) vars = if s `elem` vars then return vars else Left ("Attempting to use variable " ++ s ++ ", which does not exist")
  compliesVars (Uno _ e) vars = compliesVars e vars
  compliesVars (Duo _ e1 e2) vars = compliesHelper [e1, e2] vars
  compliesVars (Trio _ e1 e2 e3) vars = compliesHelper [e1, e2, e3] vars

  count (Literal _) = 1
  count (Var s) = 1
  count (Uno _ e) = count e + 1
  count (Duo _ e1 e2) = count e1 + count e2 + 1
  count (Trio _ e1 e2 e3) = count e1 + count e2 + count e3 + 1

compliesHelper :: [Expr] -> [String] -> Either String [String]
compliesHelper [] vars = return vars
compliesHelper (e:es) vars = do { v1 <- compliesVars e vars
                                ; v2 <- compliesHelper es vars
                                ; return $ nub (v1 ++ v2) }


eval (Literal l) _       = return l
eval (Uno o e) m         = applyUnop o (eval e m)
eval (Duo o e1 e2) m     = applyDuop o (eval e1 m) (eval e2 m)
eval (Trio o e1 e2 e3) m = applyTriop o (eval e1 m) (eval e2 m) (eval e3 m)
eval (Var s) m           = Map.lookup s m

evalStmt (Seq []) m = m
evalStmt (Seq (x:xs)) m = evalStmt (Seq xs) (evalStmt x m)
evalStmt (Assign s e) m =
  case eval e m of
    Just x  -> Map.insert s x m
    Nothing -> Map.delete s m

applyUnop :: Unop -> Result -> Result
applyUnop Negate v     = wrap1 coerceNum negate outNum v
applyUnop Log v        = wrap1 coerceNum log outNum v -- TODO change base?
applyUnop Exp v        = wrap1 coerceNum exp outNum v
applyUnop Sqrt v       = wrap1 coerceNum sqrt outNum v
applyUnop Not v        = wrap1 coerceBool not outBool v
applyUnop IsNa Nothing = Just $ Bval True
applyUnop IsNa _       = Just $ Bval False
applyUnop AsNum v      = wrap1 coerceNum id outNum v
applyUnop AsLog v      = wrap1 coerceBool id outBool v
applyUnop AsCat v      = wrap1 coerceStr id outStr v

-- Used this to test exception handling.
-- myAdd :: Double -> Double -> Double
-- myAdd a b = if a == 0 then head [] else head [1]
-- applyDuop Add v1 v2 = wrap2 coerceNum coerceNum myAdd outNum v1 v2

applyDuop :: Duop -> Result -> Result -> Result
applyDuop Add v1 v2     = wrap2 coerceNum coerceNum (+) outNum v1 v2
applyDuop Sub v1 v2     = wrap2 coerceNum coerceNum (-) outNum v1 v2
applyDuop Mul v1 v2     = wrap2 coerceNum coerceNum (*) outNum v1 v2
applyDuop Div v1 v2     = wrap2 coerceNum coerceNum (/) outNum v1 v2
applyDuop Logbase v1 v2 = wrap2 coerceNum coerceNum (flip logBase) outNum v1 v2 -- notice that important flip!
-- Slight issue: we think the string "1" equals the string "TRUE", R doesn't. Type annotations could fix this
applyDuop And v1 v2 = outBool (permissiveAnd (coerceBool v1) (coerceBool v2))
applyDuop Or v1 v2  = outBool (permissiveOr (coerceBool v1) (coerceBool v2))
applyDuop Pow v1 v2 = wrap2 coerceNum coerceNum (**) outNum v1 v2

-- TODO Tell people that we *don't* support string comparisons
-- as there's no way to decide which way to convert when we have "31.2" > 300
-- unless we had strict type annotations
applyDuop Less v1 v2      = wrap2 coerceNum coerceNum (<) outBool v1 v2
applyDuop LessEq v1 v2    = wrap2 coerceNum coerceNum (<=) outBool v1 v2
applyDuop Greater v1 v2   = wrap2 coerceNum coerceNum (>) outBool v1 v2
applyDuop GreaterEq v1 v2 = wrap2 coerceNum coerceNum (>=) outBool v1 v2
-- Just like R, it won't allow NAs to equal each other.

applyDuop Eq (Just (Sval s1)) (Just (Sval s2)) = Just $ Bval (s1 == s2)
applyDuop Eq v1 v2 = wrap2 coerceNum coerceNum (==) outBool v1 v2

applyTriop :: Triop -> Result -> Result -> Result -> Result
applyTriop Ifelse cond yes no = case coerceBool cond of
                                  (Just True)  -> yes
                                  (Just False) -> no
                                  (Nothing)    -> Nothing


permissiveAnd :: Maybe Bool -> Maybe Bool -> Maybe Bool
permissiveAnd a (Just False) = Just False
permissiveAnd (Just False) b = Just False
permissiveAnd a b            = liftM2 (&&) a b

permissiveOr :: Maybe Bool -> Maybe Bool -> Maybe Bool
permissiveOr a (Just True) = Just True
permissiveOr (Just True) b = Just True
permissiveOr a b           = liftM2 (||) a b

-- TODO delete or use this.
-- These are questionable.
-- onlyBool :: Result -> Maybe Bool
-- onlyBool (Just (Bval v)) = Just v
-- onlyBool _                = Nothing
-- onlyNum :: Result -> Maybe Double
-- onlyNum (Just (Nval v)) = Just v
-- onlyNum _                = Nothing
-- onlyText :: Result -> Maybe Text
-- onlyText (Just (Sval v)) = Just v
-- onlyText _                = Nothing

coerceNum :: Result -> Maybe Double
coerceNum (Just (Nval v)) = Just v
coerceNum (Just (Bval v)) = boolToNum v
coerceNum (Just (Sval v)) = case (strToNum v) of
                              Just x -> Just x
                              Nothing -> strToBool v >>= boolToNum
coerceNum Nothing         = Nothing

coerceBool :: Result -> Maybe Bool
coerceBool (Just (Bval v)) = Just v
coerceBool (Just (Nval v)) = numToBool v
coerceBool (Just (Sval v)) = strToBool v
coerceBool Nothing         = Nothing

coerceStr :: Result -> Maybe Text
coerceStr (Just (Bval v)) = boolToStr v
coerceStr (Just (Nval v)) = numToStr v
coerceStr (Just (Sval v)) = Just v
coerceStr Nothing         = Nothing

-- To be used when reading in data.
canonical :: Text -> Result
canonical x
  | isJust $ strToNum x = strToNum x >>= Just . Nval
  | isJust $ strToBool x = strToBool x >>= Just . Bval
  | otherwise = Just $ Sval x

-- Unambiguously represent a value in the best possible type, for equality check.
tryUnstr :: Result -> Result
tryUnstr (Just (Sval v)) = canonical v
tryUnstr other           = other

-- Utilities: one type to a Maybe of another
numToStr :: Double -> Maybe Text
numToStr = Just . Txt.pack . show

boolToStr :: Bool -> Maybe Text
boolToStr True  = Just "TRUE" -- could be T, F
boolToStr False = Just "FALSE"

strToNum :: Text -> Maybe Double
strToNum x = Read.readMaybe $ Txt.unpack x

strToBool :: Text -> Maybe Bool
strToBool v
  | v `elem` trueStrings = Just True
  | v `elem` falseStrings = Just False
  | otherwise = Nothing

boolToNum :: Bool -> Maybe Double
boolToNum True  = Just 1.0
boolToNum False = Just 0.0

numToBool :: Double -> Maybe Bool
numToBool 0.0 = Just False
numToBool _   = Just True

-- TODO delete or use this.
-- coerceNumStrict :: Val -> Maybe Double
-- coerceNumStrict (Nval v) = Nval v
-- coerceNumStrict (Sval v) =
-- coerceNumLoose :: Val -> Maybe Double

-- Only wants things that are really doubles, not bools

-- Convert a Result to the 'best' possible type (that means, read string representations.)
-- canonical :: Result -> Result
-- canonical (Just (Sval v)) = case fromSval v
                              -- of Nothing -> Just $ Sval v -- we can give up, unlike fromSval
                                --  Just x -> Just x
-- canonical x = x




grab :: Bool -> Result -> Maybe Bool
grab a b = if b == Just (Bval a) then Just a else Nothing

-- To understand these, just look at e.g. applyDuop above.
-- wrapN will take a `primitive` function, N Vals, N (Val -> Maybe <primitive>) converters, and a converter back to Val.
-- If any converters fail we'll get NA, otherwise we will run the function and convert it back to Val.
wrap1 :: (Monad m) => (Result -> m a) -> (a -> r) -> (m r -> Result) -> Result -> Result
wrap1 af f fr a = fr (return f `ap` (af a))
wrap2 :: (Monad m) => (Result -> m a) -> (Result -> m b) -> (a -> b -> r) -> (m r -> Result) -> Result -> Result -> Result
wrap2 af bf f fr a b = fr (return f `ap` (af a) `ap` (bf b))

-- possibly we can make this one function w/ type parameter, but it doesnt' really matter
outNum :: Maybe Double -> Result
outNum (Just v) = Just (Nval v)
outNum Nothing  = Nothing
outBool :: Maybe Bool -> Result
outBool (Just v) = Just (Bval v)
outBool Nothing  = Nothing
outStr :: Maybe Text -> Result
outStr (Just v) = Just (Sval v)
outStr Nothing  = Nothing

-- TODO we might remove these, if we never actually try more than one thing?
-- They take a list of operations and try to apply them until one works (doesn't give NA.)
trySet1 :: [Result -> Result] -> Result -> Result
trySet1 [] _ = Nothing
trySet1 (x:xs) a =
  case x a of
    Nothing -> trySet1 xs a
    Just v  -> Just v

trySet2 :: [Result -> Result -> Result] -> Result -> Result -> Result
trySet2 [] _ _ = Nothing
trySet2 (x:xs) a b =
  case x a b of
    Nothing -> trySet2 xs a b
    Just v  -> Just v
