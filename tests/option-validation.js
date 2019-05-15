"use strict";

/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0');



describe('Passing --option invalid-value', () => {
  var error;

  beforeEach(() => {
    program.action(function() {});
    error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('InvalidOptionValueError');
    });
  });

  afterEach(() => {
    error.restore();
    program.reset();
  });

  ['regex', 'function', 'STRING', 'INT', 'BOOL', 'FLOAT', 'LIST(int)', 'LIST(bool)', 'LIST(float)', 'LIST(repeated)'].forEach(function(checkType) {
    it(`should throw an error for ${checkType} check`, () => {
      program.action(function() {});

      if (checkType === 'regex') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds', /^\d+$/);
        program.parse(makeArgv(['-t', 'i-am-invalid']));

      } else if(checkType === 'function') {
        program.option('-t, --time <time-in-secs>', 'Time in seconds, superior to zero', function(val) {
          const o = parseInt(val);
          if (isNaN(o) || o <= 0) {
            throw new Error("'time' must be a valid number")
          }
          return o;
        });
        program.parse(makeArgv(['-t', 'i-am-invalid']));

      } else if(checkType === 'STRING') {
        program.option('-f, --file <file>', 'Time in seconds', program.STRING);
        program.parse(makeArgv(['-f']));

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
    });
  });

  it(`should throw an error for promise check`, done => {
    program.action(function() {});

    program.option('-t, --time <time-in-secs>', 'Time in seconds, superior to zero', function(val) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const o = parseInt(val);
          if (isNaN(o) || o <= 0) {
            reject(new Error("FOOOO"));
          }
          resolve(o);
        }, 10);
      })
    });
    // then.catch.then to ensure the assertion is made whether the promise resolves or not (simulates `finally` behavior for node 6 & 8)
    program.parse(makeArgv(['-t', 'i-am-invalid'])).then(() => {}).catch(() => {}).then(() => {
      const count = error.callCount;

      should(count).be.eql(1);
      done();
    })
  });
});


describe('Passing --option valid-value', () => {
  var error;

  beforeEach(() => {
    program.action(function() {});
    error = sinon.stub(program, "fatalError");
  });

  afterEach(() => {
    error.restore();
    program.reset();
  });

  ['regex', 'function', 'STRING', 'INT', 'BOOL', 'BOOL(implicit)', 'FLOAT', 'LIST(int)', 'LIST(bool)', 'LIST(float)'].forEach(function(checkType) {
    it(`should succeed for ${checkType} check`, () => {
      if (checkType === 'regex') {
        program.action(function (args, options) {
          should(options.time).eql('234');
        });
        program.option('-t, --time <time-in-secs>', 'Time in seconds', /^\d+$/);
        program.parse(makeArgv(['-t', '234']));

      } else if (checkType === 'function') {
        program.action(function (args, options) {
          should(options.time).eql(2);
        });
        program.option('-t, --time <time-in-secs>', 'Time in seconds, superior to zero', function (val) {
          const o = parseInt(val);
          if (isNaN(o) || o <= 0) {
            throw new Error("FOOOO")
          }
          return o;
        });
        program.parse(makeArgv(['-t', '2']));

      } else if (checkType === 'STRING') {
        program.action(function (args, options) {
          should(options.file).eql('foo')
        });
        program.option('-f, --file <file>', 'File', program.STRING);
        program.parse(makeArgv(['-f', 'foo']));

      } else if (checkType === 'INT') {
        program.action(function (args, options) {
          should(options.time).eql(282);
        });
        program.option('-t, --time <time-in-secs>', 'Time in seconds', program.INT);
        program.parse(makeArgv(['-t', '282']));

      } else if (checkType === 'BOOL') {
        program.action(function (args, options) {
          should(options.happy).eql(true);
        });
        program.option('--happy <value>', 'Am I happy ?', program.BOOLEAN);
        program.parse(makeArgv(['--happy', 'yes']));

      } else if (checkType === 'BOOL(implicit)') {
        program.action(function (args, options) {
          should(options.happy).eql(true);
        });
        program.option('--happy', 'Am I happy ?', program.BOOLEAN);
        program.parse(makeArgv(['--happy']));

      } else if (checkType === 'FLOAT') {
        program.action(function (args, options) {
          should(options.time).eql(2.8);
        });
        program.option('-t, --time <time-in-secs>', 'Time in seconds', program.FLOAT);
        program.parse(makeArgv(['-t', '2.8']));

      } else if (checkType === 'LIST(int)') {
        program.action(function (args, options) {
          should(options.list).eql([1, 8]);
        });
        program.option('-l, --list <list>', 'My list', program.LIST | program.INT);
        program.parse(makeArgv(['--list', '1,8']));

      } else if (checkType === 'LIST(bool)') {
        program.action(function (args, options) {
          should(options.list).eql([true, false, true, false, true, false]);
        });
        program.option('-l, --list <list>', 'My list', program.LIST | program.BOOL);
        program.parse(makeArgv(['--list', 'true,0,yes,no,1,false']));

      } else if (checkType === 'LIST(float)') {
        program.action(function (args, options) {
          should(options.list).eql([1.0, 0]);
        });
        program.option('-l, --list <list>', 'My list', program.LIST | program.FLOAT);
        program.parse(makeArgv(['--list', '1.0,0']));
      }

      const count = error.callCount;

      should(count).be.eql(0);
    });
  });

  it(`should succeed for promise check`, done => {
    var time = 0;
    program.action(function (args, options) { time = options.time });

    program.option('-t, --time <time-in-secs>', 'Time in seconds, superior to zero', function (val) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const o = parseInt(val);
          if (isNaN(o) || o <= 0) {
            reject(new Error("FOOOO"));
          }
          resolve(o);
        }, 10);
      })
    });
    // then.catch.then to ensure the assertion is made whether the promise resolves or not (simulates `finally` behavior for node 6 & 8)
    program.parse(makeArgv(['-t', '2'])).then(() => { }).catch(() => { }).then(() => {
      const count = error.callCount;
      try {
        should(count).be.eql(0);
        should(time).be.eql(2);
        done();
      } catch (e) {
        done(e);
      }
    })
  });
});


describe('Passing --unknown-option (long)', () => {

  it(`should throw UnknownOptionError`, () => {
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

describe('Setting up an option with a default value', () => {
  it(`should take default value if nothing is passed`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .option('--foo <foo-value>', 'My bar', /^[a-z]+$/, 'bar')
      .action(function(args, options){
        should(options.foo).eql('bar');
      });

    const error = sinon.stub(program, "fatalError");
    program.parse(makeArgv(['foo']));
    should(error.callCount).eql(0);
    program.reset();
    error.restore();
  });
});

describe('Setting up an option with an optional value', () => {
  it(`should work when no value is passed`, () => {

    program
      .reset()
      .command('foo', 'Fooooo')
      .option('--with-openssl [path]', 'Compile with openssl')
      .action(function(args, options){
        should(options.withOpenssl).eql(true);
      });

    const error = sinon.stub(program, "fatalError");
    program.parse(makeArgv(['foo', '--with-openssl']));
    should(error.callCount).eql(0);
    program.reset();
    error.restore();
  });
});



describe('Passing an unknown short option', () => {

  it(`should throw an error`, () => {
    program
      .reset()
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

describe('Passing a known short option', () => {

  it(`should succeed`, () => {
    program
      .reset()
      .option('-t <time-in-secs>')
      .action(function() {});

    const error = sinon.stub(program, "fatalError");
    program.parse(makeArgv(['-t', '278']));
    should(error.callCount).be.eql(0);
    error.restore();
    program.reset();
  });
});

describe('Setting up a required option (long)', () => {

  it(`should throw MissingOptionError if not passed`, () => {
    program
      .command('foo')
      .option('-t, --time <time-in-secs>', 'my option', null, null, true)
      .action(function() {});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('MissingOptionError');
    });
    program.parse(makeArgv('foo'));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});

describe('Setting up a required option (short)', () => {

  it(`should throw MissingOptionError if not passed`, () => {
    program
      .command('foo')
      .option('-t <time-in-secs>', 'my option', null, null, true)
      .action(function() {});

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('MissingOptionError');
    });
    program.parse(makeArgv('foo'));
    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});

describe('Setting up a just one short option', () => {

  it(`should work`, () => {

    const action = sinon.spy();
    program
      .command('foo')
      .option('-t <time-in-secs>')
      .action(action);

    program.parse(makeArgv(['foo', '-t', '2']));
    should(action.called).be.ok();
    should(action.args[0][1]).eql({t:'2'});
    program.reset();
  });
});


describe('Setting up a option synopsis containing an error', () => {

  it(`should throw OptionSyntaxError`, () => {

    const error = sinon.stub(program, "fatalError", function(err) {
      should(err.name).eql('OptionSyntaxError');
    });

    program
      .command('foo')
      .option('-t <time-in-secs> foo', 'my option', null, null, true)
      .action(function() {});

    should(error.callCount).be.eql(1);
    error.restore();
    program.reset();
  });
});
