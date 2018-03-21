/* global Program, logger, should, makeArgv, sinon */



describe("Issue #107 - Implicit boolean", function() {

  beforeEach(function () {

    this.program = new Program();
    this.action = sinon.spy();

    this.program
      .logger(logger)
      .version('1.0.0')
      .command('cmd', 'Command')
      .option('-b, --bool', 'Implicit boolean')
      .argument('[a]', 'A', this.program.INT)
      .action(this.action);

    this.fatalError = sinon.stub(this.program, "fatalError");
  });

  afterEach(function () {
    this.fatalError.restore();
    this.program.reset();
  });

  it(`should call the action with {a: 1} and {bool: true}`, function() {
    this.program.parse(makeArgv(['cmd', '-b', '1']));
    should(this.fatalError.callCount).eql(0);
    should(this.action.callCount).eql(1);
    // TODO: The code below doesn't work as expected for some reason I don't
    //       know.  You can confirm that by changing any value in arguments.
    //should(this.action.calledWith({a: 1}, {bool: true}, logger));
    should(this.action.firstCall.args[0]).eql({a: 1});
    should(this.action.firstCall.args[1]).eql({bool: true});
  });

  it(`should call the action with {} and {bool: true}`, function() {
    this.program.parse(makeArgv(['cmd', '-b']));
    should(this.fatalError.callCount).eql(0);
    should(this.action.callCount).eql(1);
    //should(this.action.calledWith({}, {bool: true}, logger));
    should(this.action.firstCall.args[0]).eql({});
    should(this.action.firstCall.args[1]).eql({bool: true});
  });

  it(`should call the action with {a: 1} and {bool: false}`, function() {
    this.program.parse(makeArgv(['cmd', '1']));
    should(this.fatalError.callCount).eql(0);
    should(this.action.callCount).eql(1);
    //should(this.action.calledWith({a: 1}, {bool: false}, logger));
    should(this.action.firstCall.args[0]).eql({a: 1});
    should(this.action.firstCall.args[1]).eql({bool: false});
  });
});
