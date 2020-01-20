#!/usr/bin/env bash

# This build file does nothing.
#
# It should be replaced by a build script at pre-build time,
# using Clever Cloud's CC_PRE_BUILD_HOOK, so that the default
# build script (npm run install) can build the right service.

# Example, to build the API:
# CC_PRE_BUILD_HOOK="cp -f ./scripts/build-api.sh ./scripts/build.sh"
