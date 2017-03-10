/* global Program, logger, should, makeArgv, sinon */



describe("Issue #13 - Enter negative number as Argument", function() {

  beforeEach(function () {

    this.program = new Program();
    this.action = sinon.spy();

    this.program
      .logger(logger)
      .version('1.0.0')
      .command('solve', 'Solve quadratic')
      .argument('<a>', 'A', this.program.INT)
      .argument('<b>', 'B', this.program.INT)
      .argument('<c>', 'C', this.program.INT)
      .action(this.action);

    this.fatalError = sinon.stub(this.program, "fatalError");
  });

  afterEach(function () {
    this.fatalError.restore();
    this.program.reset();
  });

  it(`should not throw WrongNumberOfArgumentError with negative number as argument`, function() {
    this.program.parse(makeArgv(['solve', '1', '2', '-3']));
    should(this.fatalError.callCount).eql(0);
    should(this.action.callCount).eql(1);
  });
});
