#!/bin/sh

set -e;

{{#each commands}}
  {{{ this }}}
{{/each}}
