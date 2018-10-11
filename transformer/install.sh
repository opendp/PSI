#!/bin/bash
stack setup
stack build
stack install
mv "`stack path --local-bin`/transformer-exe" "${1:-.}"
