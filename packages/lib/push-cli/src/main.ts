#!/usr/bin/env node

import startApplication from './index'

if (require.main === module) {
  startApplication(process.argv)
}
