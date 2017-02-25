"use strict";

/* global Program, logger, should, sinon */

const program = new Program();

program
  .logger(logger)
  .bin('myapp')
  .version('1.0.0')
  .command('foo', 'My foo');


const zshComp = `###-begin-myapp-completion-###
if type compdef &>/dev/null; then
  _myapp_completion () {
    local reply
    local si=$IFS

    IFS=$'\\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" myapp completion -- "\${words[@]}"))
    IFS=$si

    _describe 'values' reply
  }
  compdef _myapp_completion myapp
fi
###-end-myapp-completion-###
`;

const bashComp = `###-begin-myapp-completion-###
if type complete &>/dev/null; then
  _myapp_completion () {
    local words cword
    if type _get_comp_words_by_ref &>/dev/null; then
      _get_comp_words_by_ref -n = -n @ -w words -i cword
    else
      cword="$COMP_CWORD"
      words=("\${COMP_WORDS[@]}")
    fi

    local si="$IFS"
    IFS=$'\\n' COMPREPLY=($(COMP_CWORD="$cword" \\
                           COMP_LINE="$COMP_LINE" \\
                           COMP_POINT="$COMP_POINT" \\
                           myapp completion -- "\${words[@]}" \\
                           2>/dev/null)) || return $?
    IFS="$si"
  }
  complete -o default -F _myapp_completion myapp
fi
###-end-myapp-completion-###
`;


const fishComp = `###-begin-myapp-completion-###
function _myapp_completion
  set cmd (commandline -opc)
  set cursor (commandline -C)
  set completions (eval env DEBUG=\\"" \\"" COMP_CWORD=\\""$cmd\\"" COMP_LINE=\\""$cmd \\"" COMP_POINT=\\""$cursor\\"" myapp completion -- $cmd)

  for completion in $completions
    echo -e $completion
  end
end

complete -f -d 'myapp' -c myapp -a "(eval _myapp_completion)"
###-end-myapp-completion-###
`;


describe('./myapp completion zsh|bash|fish', () => {

  beforeEach(function () {
    this.info = sinon.spy(logger, "info");
  });

  afterEach(function () {
    this.info.restore();
  });

  it(`should output shell script for zsh`, function() {
    program.parse(['node', 'myapp', 'completion', 'zsh']);
    should(this.info.called).be.ok();
    should(this.info.args[0][0]).be.eql(zshComp);
  });

  it(`should output shell script for bash`, function() {
    program.parse(['node', 'myapp', 'completion', 'bash']);
    should(this.info.called).be.ok();
    //console.log(this.info.args[0][0]);
    should(this.info.args[0][0]).be.eql(bashComp);
  });

  it(`should output shell script for fish`, function() {
    program.parse(['node', 'myapp', 'completion', 'fish']);
    should(this.info.called).be.ok();
    should(this.info.args[0][0]).be.eql(fishComp);
  });

});


