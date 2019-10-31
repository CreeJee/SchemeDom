const prefix = '[SchemeDom Error]';
/**
 * @param {String} msg
 * @return {Error}
 */
export const error = (msg) => new Error(`${prefix}: ${msg}`);
