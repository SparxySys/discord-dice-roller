import org.tukaani.xz.LZMA2Options
import org.tukaani.xz.XZOutputStream

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction


import org.slf4j.Logger
import org.slf4j.LoggerFactory


class XzCompressionTask extends DefaultTask {

  Logger slf4jLogger = LoggerFactory.getLogger('XzCompressionTask')
  File input = null
  File output = null

  @TaskAction
  def compress() {
    slf4jLogger.debug('Setting up options');
    LZMA2Options options = new LZMA2Options()
    options.setPreset(6)
    XZOutputStream out = new XZOutputStream(new FileOutputStream(output), options)

    slf4jLogger.debug('Starting compression');
    byte[] buf = new byte[8192]

    FileInputStream input = new FileInputStream(input);

    int size
    while ((size = input.read(buf)) != -1) {
      slf4jLogger.debug('Reading ' + size);
      out.write(buf, 0, size);
    }

    slf4jLogger.debug('Compression complete');
    out.finish();
  }
}