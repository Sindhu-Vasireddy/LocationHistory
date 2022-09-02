import factory from 'rdf-ext';
import ParserN3 from '@rdfjs/parser-n3';
import SHACLValidator from 'rdf-validate-shacl';
import {fetch as solidfetch} from '@inrupt/solid-client-authn-browser';
const Readable = require('stream').Readable;
// const fs = require('fs');

let factoryDatatset;
/**
 *  Main Validate function for SHACL.
 * @param {String} shapes_ Path to shapes file.
 * @param {String} data_ Path to data file
 * @return {*} Validation report.
 */
export async function main(shapes_, data_) {
  const shapes = await loadDataset(shapes_);
  const data = await loadDataset(data_);

  const validator = new SHACLValidator(shapes, {factory});
  const report = await validator.validate(data);

  // eslint-disable-next-line max-len
  console.log(`SHACL Validation Result of ${data_}: \r\n Conforms? ${report.conforms ? 'Yes' : 'False. See details below.'}`);

  for (const result of report.results) {
    console.error('SHACL Validation Error! see below for details');
    console.log(result.message);
    console.log(result.path);
    console.log(result.focusNode);
    console.log(result.severity);
    console.log(result.sourceConstraintComponent);
    console.log(result.sourceShape);
  }
  return report.conforms;
}
/**
 * Loads dataset
 * @param {String} filePath Path to file to load dataset
 * @return {*} N3 factory dataset.
 */
async function loadDataset(filePath) {
  const stream = new Readable();
  const response_ = await solidfetch(filePath, {
    method: 'GET',
    headers: {'Content-Type': 'text/turtle'},
    credentials: 'include',
  })
  const responsefile = await response_.text()
  stream._read = () => {}; // stream should be made readable.
  stream.push(responsefile.toString());
  stream.push(null);

  const parser = new ParserN3({factory});
  let factoryDatatset = await factory.dataset().import(parser.import(stream));
  return factoryDatatset;
}
