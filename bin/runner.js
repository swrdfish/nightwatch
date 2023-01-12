/**
 * Module dependencies
 */
const Nightwatch = require('../lib/index.js');
const {Logger, shouldReplaceStack, alwaysDisplayError} = require('../lib/utils');

try {
  Nightwatch.cli(function (argv) {
    argv._source = argv['_'].slice(0);

    __writeLog('load_cli_runner', 'start');

    const runner = Nightwatch.CliRunner(argv);

    __writeLog('load_cli_runner', 'end');

    return runner
      .setupAsync()
      .catch((err) => {
        if (err.code === 'ERR_REQUIRE_ESM') {
          err.showTrace = false;
        }

        throw err;
      })
      .then(async () => {
        __writeLog('cli_runner_run_test', 'start');

        const res = await runner.runTests();

        __writeLog('cli_runner_run_test', 'end');

        return res;
      })
      .then(result => {
        __writeLog('cli_invoke', 'end');

        return result;
      })
      .catch((err) => {
        if (!err.displayed || (alwaysDisplayError(err) && !err.displayed)) {
          Logger.error(err);
        }

        __writeLog('process_exit_with_error_10');
        runner.processListener.setExitCode(10).exit();
      });
  });
} catch (err) {
  const {message} = err;
  err.message = 'An error occurred while trying to start the Nightwatch Runner:';
  err.showTrace = !shouldReplaceStack(err);
  err.detailedErr = message;

  Logger.error(err);
  __writeLog('process_exit_with_error_2');
  process.exit(2);
}
