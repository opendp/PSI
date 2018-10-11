{-# LANGUAGE OverloadedStrings #-}

-- Greatly inspired by https://wiki.haskell.org/Parsing_expressions_and_statements
module Parse where
-- import Text.Parsec (parse, ParseError, (<?>), try, many, many1)
-- import qualified Text.Parsec as P
import           Text.Parsec
-- import qualified Text.Parsec.Char as PC
import           Text.Parsec.String
-- import Control.Applicative hiding (many, (<|>), optional)
import           Eval
import           Text.Parsec.Expr
import           Text.Parsec.Language
import qualified Text.Parsec.Token    as Token
-- Data.Map.Lazy or .Strict?
import qualified Data.Text.Lazy       as Txt
import           Data.List (any)

def = emptyDef{ Token.identStart = letter <|> char '_' <|> char '.'
              , Token.identLetter = alphaNum <|> char '_' <|> char '.'
              , Token.reservedNames = map Txt.unpack trueStrings ++ map Txt.unpack falseStrings ++ ["log", "ifelse", "exp", "switch", "sqrt", "as.na", "as.numeric", "as.logical", "as.categorical", "as.character"] -- need add more ? -- TODO making 'log' reserved seems harsh, if we can do a better parsing system
              , Token.opStart        = Token.opLetter def
              , Token.opLetter       = oneOf ":!#$%&*+./<=>?@\\^|-~" -- from the default emptydef
              }

-- the qualification here is ugly but keeps us from messing things up later
Token.TokenParser
           { Token.parens = parens
           , Token.identifier = identifier
           , Token.reservedOp = reservedOp
           , Token.reserved = reserved
           , Token.semi = semi
           , Token.comma = comma
           , Token.semiSep1 = semiSep1
           , Token.whiteSpace = whiteSpace
           , Token.float = float
           , Token.stringLiteral = stringLiteral
           , Token.integer = integer } = Token.makeTokenParser def


-- TODO Provide a way for people to access identifiers which are reserved words?
expr :: Parser Expr
expr = buildExpressionParser table term <?> "expression"
table = [ [Infix ((reservedOp "**" <|> reservedOp "^") >> return (Duo Pow)) AssocLeft]
        , [Prefix (reservedOp "-" >> return (Uno Negate))]
        , [Infix (reservedOp "*" >> return (Duo Mul)) AssocLeft, Infix (reservedOp "/" >> return (Duo Div)) AssocLeft]
        , [Infix (reservedOp "+" >> return (Duo Add)) AssocLeft, Infix (reservedOp "-" >> return (Duo Sub)) AssocLeft]
        , [ Infix (reservedOp "<=" >> return (Duo LessEq)) AssocLeft
          , Infix (reservedOp ">=" >> return (Duo GreaterEq)) AssocLeft
          , Infix (reservedOp "<" >> return (Duo Less)) AssocLeft
          , Infix (reservedOp ">" >> return (Duo Greater)) AssocLeft
          , Infix (reservedOp "==" >> return (Duo Eq)) AssocLeft
          , Infix (reservedOp "!=" >> return (\v1 v2 -> Uno Not $ Duo Eq v1 v2 )) AssocLeft
          ]
        , [Prefix (reservedOp "!" >> return (Uno Not))]
        , [Infix ((reservedOp "&&" <|> reservedOp "&") >> return (Duo And)) AssocLeft]
        , [Infix ((reservedOp "||" <|> reservedOp "|") >> return (Duo Or)) AssocLeft]
        ]

term :: Parser Expr
term = parens expr -- not "parens term"?
       <|> (fmap (Uno Exp) (reserved "exp" *> parens expr))
       <|> (fmap (Uno Sqrt) (reserved "sqrt" *> parens expr))
       <|> (fmap (Uno IsNa) (reserved "is.na" *> parens expr))
       <|> (fmap (Uno AsNum) (reserved "as.numeric" *> parens expr))
       <|> (fmap (Uno AsLog) (reserved "as.logical" *> parens expr))
       <|> (fmap (Uno AsCat) (reserved "as.categorical" *> parens expr))
       <|> (fmap (Uno AsCat) (reserved "as.character" *> parens expr))
       <|> (fmap (Uno Log) (try (reserved "log" *> parens expr)))
       <|> reserved "log" *> parens (fmap (Duo Logbase) expr <*> (comma *> expr))
       -- TODO implement switch (might be difficult)
       -- TODO definitely need is.na, etc. (is.numeric etc also)
       -- TODO can we build these into the expression parser?
       -- JM commented out below to disable if else in transformer
      -- <|> (reserved "ifelse" *> parens (fmap (Trio Ifelse) expr <*> (comma *> expr) <*> (comma *> expr)))
       <|> fmap Var identifier
       <|> (reserved "TRUE" >> return (Literal $ Bval True)) -- TODO support all trueStrings (with foldl?)
       <|> (reserved "FALSE" >> return (Literal $ Bval False))
       <|> fmap (Literal . Nval) (try float)
       <|> fmap (Literal . Nval . fromInteger) integer
       <|> fmap (Literal . Sval . Txt.pack) verifiedStringLiteral
       <?> "term"
       -- We probably shouldn't allow NA literals, that'll just have people think they should use == NA.

verifiedStringLiteral = do { x <- stringLiteral
                             ; if length x <= 100 then return x else parserFail "String is too long (over 100 characters)!"}

-- We fix sepby1 to use a try, so it won't consume a final semicolon and then demand a statement!
sepby1fixed p sep = do { x <- p
                       ; xs <- many (try(sep >> p))
                       ; return (x:xs)
                       }

semiSep1fixed p = sepby1fixed p semi

stmtparser :: Parser Stmt
stmtparser = fmap Seq (semiSep1fixed stmt1)

stmt1 = do { v <- identifier
           ; reservedOp "<-" <|> reservedOp "="
           ; e <- expr
           ; return (Assign v e)
           }

mainparser :: Parser Stmt
mainparser = whiteSpace >> (stmtparser <* (optional semi)) <* eof
