#!/bin/sh

set -e;

{{#each commands}}
(cd "{{this.dir}}" && {{this.cmd}});
{{/each}}
