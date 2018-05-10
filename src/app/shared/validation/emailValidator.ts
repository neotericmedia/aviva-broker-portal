import { FormControl } from '@angular/forms';

/**
 * Custom Validator to check whether if the input value has a valid email
 *
 * ^( // Must start with
 *    ( // X or X.X.X...X where X is anything except any of these <>()\[\]\\.,;:\s@"
 *      [^<>()\[\]\\.,;:\s@"]+
 *      (\.
 *        [^<>()\[\]\\.,;:\s@"]+
 *      )*
 *    )
 *    |
 *    (".+") // Anything that is enclosed within two double-quotes
 * )
 * @ // Must have one @ somewhere
 * (
 *    (\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}]) // Valid ip address
 *    |
 *    (([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})
 *    // valid domain name which must ends with .X where X is a string of two or more characters, e.g. .CA, .com, or .info
 * )$ // Must end with
 *
 *  - Invalid email pattern
 *    abc, @abc.com abc@, abc@pqr, abc@pqr.456, abc@$$!!.com, some@pqr.234
 *
 *  - Valid email pattern
 *    abc@abc.com, "@123"@pqr.com, abc@abc.somedomain.subdomain, 12345@whatever.somedomain, 2#!!!4@something.other
 *
 * @param input: FormControl
 */
const emailPattern = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
export function EmailValidator(input: FormControl) {
  const email = input.value;
  return emailPattern.test(email) ? null : { invalidEmail: true };
}
