/* global Program, logger, should, makeArgv, sinon */

const program = new Program();

program
  .logger(logger)
  .version('1.0.0')
  .reset()
  .command('solve', 'Solve quadratic')
  .argument('<a>', 'A', program.INT)
  .argument('<b>', 'B', program.INT)
  .argument('<c>', 'C', program.INT)
  .action(function(){});

describe("Issue #13 - Enter negative number as Argument", function() {

  beforeEach(function () {
    this.fatalError = sinon.stub(program, "fatalError");
  });

  afterEach(function () {
    this.fatalError.restore();
    program.reset();
  });

  it(`should not throw WrongNumberOfArgumentError with negative number as argument`, function() {
    program.parse(makeArgv(['1', '2', '-3']));
    should(this.fatalError.callCount).eql(0);
  });
});
