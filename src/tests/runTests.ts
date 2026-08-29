import { runAllTests } from './floodEngine.test';

const { passed, failed } = runAllTests();
if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
