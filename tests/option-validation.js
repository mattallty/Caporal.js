"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')



describe('{caporal/program} --option invalid-value', () => {

  ['regex', 'function', 'INT', 'BOOL', 'FLOAT', 'LIST(int)', 'LIST(bool)', 'LIST(float)', 'LIST(repeated)'].forEach(function(checkType) {
    it(`should throw an error for ${checkType} check`, () => {

      const error = sinon.stub(program, "fatalError", function(err) {
        should(err.name).eql('InvalidOptionValueError');
      });

      program.action(function() {});

      if (checkType === 'regex') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', /^\d+$/);
        program.parse(makeArgv(['-t', 'i-am-invalid']));

      } else if(checkType === 'function') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds, superior to zero', function(val) {
          const o = parseInt(val);
          if (isNaN(o) || o <= 0) {
            throw new Error("FOOOO")
          }
          return o;
        });
        program.parse(makeArgv(['-t', 'i-am-invalid']));

      } else if(checkType === 'INT') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', program.INT);
        program.parse(makeArgv(['-t', 'i-am-invalid']));

      } else if(checkType === 'BOOL') {
        program.option('--happy <value>', 'Am I happy ?', program.BOOLEAN);
        program.parse(makeArgv(['--happy', 'i-am-invalid']));

      } else if(checkType === 'FLOAT') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', program.FLOAT);
        program.parse(makeArgv(['-t', 'i-am-invalid']));

      } else if(checkType === 'LIST(int)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.INT);
        program.parse(makeArgv(['--list', '0,1,A']));

      } else if(checkType === 'LIST(bool)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.BOOL);
        program.parse(makeArgv(['--list', 'true,0,fake']));

      } else if(checkType === 'LIST(float)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.FLOAT);
        program.parse(makeArgv(['--list', '1.0,0,fake']));
      }
      else if(checkType === 'LIST(repeated)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.FLOAT);
        program.parse(makeArgv(['--list', '1.0', '--list','fake']));
      }

      const count = error.callCount;

      should(count).be.eql(1);

      program.reset();
      error.restore();
    });
  });
});


describe('{caporal/program} --option valid-value', () => {

  ['regex', 'function', 'INT', 'BOOL', 'BOOL(implicit)', 'FLOAT', 'LIST(int)', 'LIST(bool)', 'LIST(float)'].forEach(function(checkType) {
    it(`should succeed for ${checkType} check`, () => {

      const error = sinon.stub(program, "fatalError");

      program.action(function() {});

      if (checkType === 'regex') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', /^\d+$/);
        program.parse(makeArgv(['-t', '234']));

      } else if(checkType === 'function') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds, superior to zero', function(val) {
          const o = parseInt(val);
          if (isNaN(o) || o <= 0) {
            throw new Error("FOOOO")
          }
          return o;
        });
        program.parse(makeArgv(['-t', '2']));

      } else if(checkType === 'INT') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', program.INT);
        program.parse(makeArgv(['-t', '282']));

      } else if(checkType === 'BOOL') {
        program.option('--happy <value>', 'Am I happy ?', program.BOOLEAN);
        program.parse(makeArgv(['--happy', 'yes']));

      } else if(checkType === 'BOOL(implicit)') {
        program.option('--happy', 'Am I happy ?', program.BOOLEAN);
        program.parse(makeArgv(['--happy']));

      } else if(checkType === 'FLOAT') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', program.FLOAT);
        program.parse(makeArgv(['-t', '2.8']));

      } else if(checkType === 'LIST(int)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.INT);
        program.parse(makeArgv(['--list', '1,8']));

      } else if(checkType === 'LIST(bool)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.BOOL);
        program.parse(makeArgv(['--list', 'true,0,yes,no,1,false']));

      } else if(checkType === 'LIST(float)') {
        program.option('-l, --list <list>', 'My list', program.LIST | program.FLOAT);
        program.parse(makeArgv(['--list', '1.0,0']));
      }

      const count = error.callCount;

      should(count).be.eql(0);

      program.reset();
      error.restore();
    });
  });
});


describe('{caporal/program} --unknown-option (long)', () => {

  it(`should throw an error`, () => {
    program
      .option('-t, --time <time-in-secs>')
      .action(function() {});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('UnknownOptionError');
    });
    program.parse(makeArgv('--unknown-option'));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});



describe('{caporal/program} -u (short)', () => {

  it(`should throw an error`, () => {
    program
      .option('-t, --time <time-in-secs>')
      .action(function() {});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('UnknownOptionError');
    });
    program.parse(makeArgv('-u'));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});
