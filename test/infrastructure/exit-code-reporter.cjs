const {
  default: ReporterDefault
} = require('sarg/lib/src/reporters/ReporterDefault');
const { ReporterEvents } = require('sarg/lib/src/reporters/Reporter');

class ExitCodeReporter extends ReporterDefault {
  describe(event) {
    if (
      event === ReporterEvents.FailTest ||
      event === ReporterEvents.FailRequire ||
      event === ReporterEvents.FailEachExecutor ||
      event === ReporterEvents.FailFilenameExecutor
    ) {
      process.exitCode = 1;
    }
    if (
      event === ReporterEvents.Finished &&
      this.successesCount + this.failuresCount === 0
    ) {
      process.exitCode = 1;
      this.stderr.write('No tests were executed.\n');
    }
    super.describe(event);
  }
}

exports.default = ExitCodeReporter;
