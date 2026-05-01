#!/usr/bin/env bash
# Prism v2 routing injection wrapper - delegates to python implementation.
exec python "$(dirname "$0")/prism_inject_routing.py"
