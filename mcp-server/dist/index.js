#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util = __esm({
  "../node_modules/zod/v3/helpers/util.js"() {
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
  }
});

// ../node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "../node_modules/zod/v3/ZodError.js"() {
    init_util();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class _ZodError extends Error {
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// ../node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "../node_modules/zod/v3/locales/en.js"() {
    init_ZodError();
    init_util();
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    };
    en_default = errorMap;
  }
});

// ../node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors = __esm({
  "../node_modules/zod/v3/errors.js"() {
    init_en();
    overrideErrorMap = en_default;
  }
});

// ../node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync;
var init_parseUtil = __esm({
  "../node_modules/zod/v3/helpers/parseUtil.js"() {
    init_errors();
    init_en();
    makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
  }
});

// ../node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "../node_modules/zod/v3/helpers/typeAliases.js"() {
  }
});

// ../node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "../node_modules/zod/v3/helpers/errorUtil.js"() {
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// ../node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "../node_modules/zod/v3/types.js"() {
    init_ZodError();
    init_errors();
    init_errorUtil();
    init_parseUtil();
    init_util();
    ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: (data) => this["~validate"](data)
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = (data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        };
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: ((arg) => ZodString.create({ ...arg, coerce: true })),
      number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
      boolean: ((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })),
      bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
      date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
    };
    NEVER = INVALID;
  }
});

// ../node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "../node_modules/zod/v3/external.js"() {
    init_errors();
    init_parseUtil();
    init_typeAliases();
    init_util();
    init_types();
    init_ZodError();
  }
});

// ../node_modules/zod/index.js
var init_zod = __esm({
  "../node_modules/zod/index.js"() {
    init_external();
    init_external();
  }
});

// ../node_modules/@modelcontextprotocol/sdk/dist/types.js
var LATEST_PROTOCOL_VERSION, SUPPORTED_PROTOCOL_VERSIONS, JSONRPC_VERSION, ProgressTokenSchema, CursorSchema, BaseRequestParamsSchema, RequestSchema, BaseNotificationParamsSchema, NotificationSchema, ResultSchema, RequestIdSchema, JSONRPCRequestSchema, JSONRPCNotificationSchema, JSONRPCResponseSchema, ErrorCode, JSONRPCErrorSchema, JSONRPCMessageSchema, EmptyResultSchema, CancelledNotificationSchema, ImplementationSchema, ClientCapabilitiesSchema, InitializeRequestSchema, ServerCapabilitiesSchema, InitializeResultSchema, InitializedNotificationSchema, PingRequestSchema, ProgressSchema, ProgressNotificationSchema, PaginatedRequestSchema, PaginatedResultSchema, ResourceContentsSchema, TextResourceContentsSchema, BlobResourceContentsSchema, ResourceSchema, ResourceTemplateSchema, ListResourcesRequestSchema, ListResourcesResultSchema, ListResourceTemplatesRequestSchema, ListResourceTemplatesResultSchema, ReadResourceRequestSchema, ReadResourceResultSchema, ResourceListChangedNotificationSchema, SubscribeRequestSchema, UnsubscribeRequestSchema, ResourceUpdatedNotificationSchema, PromptArgumentSchema, PromptSchema, ListPromptsRequestSchema, ListPromptsResultSchema, GetPromptRequestSchema, TextContentSchema, ImageContentSchema, EmbeddedResourceSchema, PromptMessageSchema, GetPromptResultSchema, PromptListChangedNotificationSchema, ToolSchema, ListToolsRequestSchema, ListToolsResultSchema, CallToolResultSchema, CompatibilityCallToolResultSchema, CallToolRequestSchema, ToolListChangedNotificationSchema, LoggingLevelSchema, SetLevelRequestSchema, LoggingMessageNotificationSchema, ModelHintSchema, ModelPreferencesSchema, SamplingMessageSchema, CreateMessageRequestSchema, CreateMessageResultSchema, ResourceReferenceSchema, PromptReferenceSchema, CompleteRequestSchema, CompleteResultSchema, RootSchema, ListRootsRequestSchema, ListRootsResultSchema, RootsListChangedNotificationSchema, ClientRequestSchema, ClientNotificationSchema, ClientResultSchema, ServerRequestSchema, ServerNotificationSchema, ServerResultSchema, McpError;
var init_types2 = __esm({
  "../node_modules/@modelcontextprotocol/sdk/dist/types.js"() {
    init_zod();
    LATEST_PROTOCOL_VERSION = "2024-11-05";
    SUPPORTED_PROTOCOL_VERSIONS = [
      LATEST_PROTOCOL_VERSION,
      "2024-10-07"
    ];
    JSONRPC_VERSION = "2.0";
    ProgressTokenSchema = external_exports.union([external_exports.string(), external_exports.number().int()]);
    CursorSchema = external_exports.string();
    BaseRequestParamsSchema = external_exports.object({
      _meta: external_exports.optional(external_exports.object({
        /**
         * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
         */
        progressToken: external_exports.optional(ProgressTokenSchema)
      }).passthrough())
    }).passthrough();
    RequestSchema = external_exports.object({
      method: external_exports.string(),
      params: external_exports.optional(BaseRequestParamsSchema)
    });
    BaseNotificationParamsSchema = external_exports.object({
      /**
       * This parameter name is reserved by MCP to allow clients and servers to attach additional metadata to their notifications.
       */
      _meta: external_exports.optional(external_exports.object({}).passthrough())
    }).passthrough();
    NotificationSchema = external_exports.object({
      method: external_exports.string(),
      params: external_exports.optional(BaseNotificationParamsSchema)
    });
    ResultSchema = external_exports.object({
      /**
       * This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.
       */
      _meta: external_exports.optional(external_exports.object({}).passthrough())
    }).passthrough();
    RequestIdSchema = external_exports.union([external_exports.string(), external_exports.number().int()]);
    JSONRPCRequestSchema = external_exports.object({
      jsonrpc: external_exports.literal(JSONRPC_VERSION),
      id: RequestIdSchema
    }).merge(RequestSchema).strict();
    JSONRPCNotificationSchema = external_exports.object({
      jsonrpc: external_exports.literal(JSONRPC_VERSION)
    }).merge(NotificationSchema).strict();
    JSONRPCResponseSchema = external_exports.object({
      jsonrpc: external_exports.literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      result: ResultSchema
    }).strict();
    (function(ErrorCode2) {
      ErrorCode2[ErrorCode2["ConnectionClosed"] = -1] = "ConnectionClosed";
      ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
      ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
      ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
      ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
      ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
    })(ErrorCode || (ErrorCode = {}));
    JSONRPCErrorSchema = external_exports.object({
      jsonrpc: external_exports.literal(JSONRPC_VERSION),
      id: RequestIdSchema,
      error: external_exports.object({
        /**
         * The error type that occurred.
         */
        code: external_exports.number().int(),
        /**
         * A short description of the error. The message SHOULD be limited to a concise single sentence.
         */
        message: external_exports.string(),
        /**
         * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
         */
        data: external_exports.optional(external_exports.unknown())
      })
    }).strict();
    JSONRPCMessageSchema = external_exports.union([
      JSONRPCRequestSchema,
      JSONRPCNotificationSchema,
      JSONRPCResponseSchema,
      JSONRPCErrorSchema
    ]);
    EmptyResultSchema = ResultSchema.strict();
    CancelledNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/cancelled"),
      params: BaseNotificationParamsSchema.extend({
        /**
         * The ID of the request to cancel.
         *
         * This MUST correspond to the ID of a request previously issued in the same direction.
         */
        requestId: RequestIdSchema,
        /**
         * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
         */
        reason: external_exports.string().optional()
      })
    });
    ImplementationSchema = external_exports.object({
      name: external_exports.string(),
      version: external_exports.string()
    }).passthrough();
    ClientCapabilitiesSchema = external_exports.object({
      /**
       * Experimental, non-standard capabilities that the client supports.
       */
      experimental: external_exports.optional(external_exports.object({}).passthrough()),
      /**
       * Present if the client supports sampling from an LLM.
       */
      sampling: external_exports.optional(external_exports.object({}).passthrough()),
      /**
       * Present if the client supports listing roots.
       */
      roots: external_exports.optional(external_exports.object({
        /**
         * Whether the client supports issuing notifications for changes to the roots list.
         */
        listChanged: external_exports.optional(external_exports.boolean())
      }).passthrough())
    }).passthrough();
    InitializeRequestSchema = RequestSchema.extend({
      method: external_exports.literal("initialize"),
      params: BaseRequestParamsSchema.extend({
        /**
         * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
         */
        protocolVersion: external_exports.string(),
        capabilities: ClientCapabilitiesSchema,
        clientInfo: ImplementationSchema
      })
    });
    ServerCapabilitiesSchema = external_exports.object({
      /**
       * Experimental, non-standard capabilities that the server supports.
       */
      experimental: external_exports.optional(external_exports.object({}).passthrough()),
      /**
       * Present if the server supports sending log messages to the client.
       */
      logging: external_exports.optional(external_exports.object({}).passthrough()),
      /**
       * Present if the server offers any prompt templates.
       */
      prompts: external_exports.optional(external_exports.object({
        /**
         * Whether this server supports issuing notifications for changes to the prompt list.
         */
        listChanged: external_exports.optional(external_exports.boolean())
      }).passthrough()),
      /**
       * Present if the server offers any resources to read.
       */
      resources: external_exports.optional(external_exports.object({
        /**
         * Whether this server supports clients subscribing to resource updates.
         */
        subscribe: external_exports.optional(external_exports.boolean()),
        /**
         * Whether this server supports issuing notifications for changes to the resource list.
         */
        listChanged: external_exports.optional(external_exports.boolean())
      }).passthrough()),
      /**
       * Present if the server offers any tools to call.
       */
      tools: external_exports.optional(external_exports.object({
        /**
         * Whether this server supports issuing notifications for changes to the tool list.
         */
        listChanged: external_exports.optional(external_exports.boolean())
      }).passthrough())
    }).passthrough();
    InitializeResultSchema = ResultSchema.extend({
      /**
       * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
       */
      protocolVersion: external_exports.string(),
      capabilities: ServerCapabilitiesSchema,
      serverInfo: ImplementationSchema
    });
    InitializedNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/initialized")
    });
    PingRequestSchema = RequestSchema.extend({
      method: external_exports.literal("ping")
    });
    ProgressSchema = external_exports.object({
      /**
       * The progress thus far. This should increase every time progress is made, even if the total is unknown.
       */
      progress: external_exports.number(),
      /**
       * Total number of items to process (or total progress required), if known.
       */
      total: external_exports.optional(external_exports.number())
    }).passthrough();
    ProgressNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/progress"),
      params: BaseNotificationParamsSchema.merge(ProgressSchema).extend({
        /**
         * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
         */
        progressToken: ProgressTokenSchema
      })
    });
    PaginatedRequestSchema = RequestSchema.extend({
      params: BaseRequestParamsSchema.extend({
        /**
         * An opaque token representing the current pagination position.
         * If provided, the server should return results starting after this cursor.
         */
        cursor: external_exports.optional(CursorSchema)
      }).optional()
    });
    PaginatedResultSchema = ResultSchema.extend({
      /**
       * An opaque token representing the pagination position after the last returned result.
       * If present, there may be more results available.
       */
      nextCursor: external_exports.optional(CursorSchema)
    });
    ResourceContentsSchema = external_exports.object({
      /**
       * The URI of this resource.
       */
      uri: external_exports.string(),
      /**
       * The MIME type of this resource, if known.
       */
      mimeType: external_exports.optional(external_exports.string())
    }).passthrough();
    TextResourceContentsSchema = ResourceContentsSchema.extend({
      /**
       * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
       */
      text: external_exports.string()
    });
    BlobResourceContentsSchema = ResourceContentsSchema.extend({
      /**
       * A base64-encoded string representing the binary data of the item.
       */
      blob: external_exports.string().base64()
    });
    ResourceSchema = external_exports.object({
      /**
       * The URI of this resource.
       */
      uri: external_exports.string(),
      /**
       * A human-readable name for this resource.
       *
       * This can be used by clients to populate UI elements.
       */
      name: external_exports.string(),
      /**
       * A description of what this resource represents.
       *
       * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
       */
      description: external_exports.optional(external_exports.string()),
      /**
       * The MIME type of this resource, if known.
       */
      mimeType: external_exports.optional(external_exports.string())
    }).passthrough();
    ResourceTemplateSchema = external_exports.object({
      /**
       * A URI template (according to RFC 6570) that can be used to construct resource URIs.
       */
      uriTemplate: external_exports.string(),
      /**
       * A human-readable name for the type of resource this template refers to.
       *
       * This can be used by clients to populate UI elements.
       */
      name: external_exports.string(),
      /**
       * A description of what this template is for.
       *
       * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
       */
      description: external_exports.optional(external_exports.string()),
      /**
       * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
       */
      mimeType: external_exports.optional(external_exports.string())
    }).passthrough();
    ListResourcesRequestSchema = PaginatedRequestSchema.extend({
      method: external_exports.literal("resources/list")
    });
    ListResourcesResultSchema = PaginatedResultSchema.extend({
      resources: external_exports.array(ResourceSchema)
    });
    ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
      method: external_exports.literal("resources/templates/list")
    });
    ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
      resourceTemplates: external_exports.array(ResourceTemplateSchema)
    });
    ReadResourceRequestSchema = RequestSchema.extend({
      method: external_exports.literal("resources/read"),
      params: BaseRequestParamsSchema.extend({
        /**
         * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
         */
        uri: external_exports.string()
      })
    });
    ReadResourceResultSchema = ResultSchema.extend({
      contents: external_exports.array(external_exports.union([TextResourceContentsSchema, BlobResourceContentsSchema]))
    });
    ResourceListChangedNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/resources/list_changed")
    });
    SubscribeRequestSchema = RequestSchema.extend({
      method: external_exports.literal("resources/subscribe"),
      params: BaseRequestParamsSchema.extend({
        /**
         * The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.
         */
        uri: external_exports.string()
      })
    });
    UnsubscribeRequestSchema = RequestSchema.extend({
      method: external_exports.literal("resources/unsubscribe"),
      params: BaseRequestParamsSchema.extend({
        /**
         * The URI of the resource to unsubscribe from.
         */
        uri: external_exports.string()
      })
    });
    ResourceUpdatedNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/resources/updated"),
      params: BaseNotificationParamsSchema.extend({
        /**
         * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
         */
        uri: external_exports.string()
      })
    });
    PromptArgumentSchema = external_exports.object({
      /**
       * The name of the argument.
       */
      name: external_exports.string(),
      /**
       * A human-readable description of the argument.
       */
      description: external_exports.optional(external_exports.string()),
      /**
       * Whether this argument must be provided.
       */
      required: external_exports.optional(external_exports.boolean())
    }).passthrough();
    PromptSchema = external_exports.object({
      /**
       * The name of the prompt or prompt template.
       */
      name: external_exports.string(),
      /**
       * An optional description of what this prompt provides
       */
      description: external_exports.optional(external_exports.string()),
      /**
       * A list of arguments to use for templating the prompt.
       */
      arguments: external_exports.optional(external_exports.array(PromptArgumentSchema))
    }).passthrough();
    ListPromptsRequestSchema = PaginatedRequestSchema.extend({
      method: external_exports.literal("prompts/list")
    });
    ListPromptsResultSchema = PaginatedResultSchema.extend({
      prompts: external_exports.array(PromptSchema)
    });
    GetPromptRequestSchema = RequestSchema.extend({
      method: external_exports.literal("prompts/get"),
      params: BaseRequestParamsSchema.extend({
        /**
         * The name of the prompt or prompt template.
         */
        name: external_exports.string(),
        /**
         * Arguments to use for templating the prompt.
         */
        arguments: external_exports.optional(external_exports.record(external_exports.string()))
      })
    });
    TextContentSchema = external_exports.object({
      type: external_exports.literal("text"),
      /**
       * The text content of the message.
       */
      text: external_exports.string()
    }).passthrough();
    ImageContentSchema = external_exports.object({
      type: external_exports.literal("image"),
      /**
       * The base64-encoded image data.
       */
      data: external_exports.string().base64(),
      /**
       * The MIME type of the image. Different providers may support different image types.
       */
      mimeType: external_exports.string()
    }).passthrough();
    EmbeddedResourceSchema = external_exports.object({
      type: external_exports.literal("resource"),
      resource: external_exports.union([TextResourceContentsSchema, BlobResourceContentsSchema])
    }).passthrough();
    PromptMessageSchema = external_exports.object({
      role: external_exports.enum(["user", "assistant"]),
      content: external_exports.union([
        TextContentSchema,
        ImageContentSchema,
        EmbeddedResourceSchema
      ])
    }).passthrough();
    GetPromptResultSchema = ResultSchema.extend({
      /**
       * An optional description for the prompt.
       */
      description: external_exports.optional(external_exports.string()),
      messages: external_exports.array(PromptMessageSchema)
    });
    PromptListChangedNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/prompts/list_changed")
    });
    ToolSchema = external_exports.object({
      /**
       * The name of the tool.
       */
      name: external_exports.string(),
      /**
       * A human-readable description of the tool.
       */
      description: external_exports.optional(external_exports.string()),
      /**
       * A JSON Schema object defining the expected parameters for the tool.
       */
      inputSchema: external_exports.object({
        type: external_exports.literal("object"),
        properties: external_exports.optional(external_exports.object({}).passthrough())
      }).passthrough()
    }).passthrough();
    ListToolsRequestSchema = PaginatedRequestSchema.extend({
      method: external_exports.literal("tools/list")
    });
    ListToolsResultSchema = PaginatedResultSchema.extend({
      tools: external_exports.array(ToolSchema)
    });
    CallToolResultSchema = ResultSchema.extend({
      content: external_exports.array(external_exports.union([TextContentSchema, ImageContentSchema, EmbeddedResourceSchema])),
      isError: external_exports.boolean().default(false).optional()
    });
    CompatibilityCallToolResultSchema = CallToolResultSchema.or(ResultSchema.extend({
      toolResult: external_exports.unknown()
    }));
    CallToolRequestSchema = RequestSchema.extend({
      method: external_exports.literal("tools/call"),
      params: BaseRequestParamsSchema.extend({
        name: external_exports.string(),
        arguments: external_exports.optional(external_exports.record(external_exports.unknown()))
      })
    });
    ToolListChangedNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/tools/list_changed")
    });
    LoggingLevelSchema = external_exports.enum([
      "debug",
      "info",
      "notice",
      "warning",
      "error",
      "critical",
      "alert",
      "emergency"
    ]);
    SetLevelRequestSchema = RequestSchema.extend({
      method: external_exports.literal("logging/setLevel"),
      params: BaseRequestParamsSchema.extend({
        /**
         * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
         */
        level: LoggingLevelSchema
      })
    });
    LoggingMessageNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/message"),
      params: BaseNotificationParamsSchema.extend({
        /**
         * The severity of this log message.
         */
        level: LoggingLevelSchema,
        /**
         * An optional name of the logger issuing this message.
         */
        logger: external_exports.optional(external_exports.string()),
        /**
         * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
         */
        data: external_exports.unknown()
      })
    });
    ModelHintSchema = external_exports.object({
      /**
       * A hint for a model name.
       */
      name: external_exports.string().optional()
    }).passthrough();
    ModelPreferencesSchema = external_exports.object({
      /**
       * Optional hints to use for model selection.
       */
      hints: external_exports.optional(external_exports.array(ModelHintSchema)),
      /**
       * How much to prioritize cost when selecting a model.
       */
      costPriority: external_exports.optional(external_exports.number().min(0).max(1)),
      /**
       * How much to prioritize sampling speed (latency) when selecting a model.
       */
      speedPriority: external_exports.optional(external_exports.number().min(0).max(1)),
      /**
       * How much to prioritize intelligence and capabilities when selecting a model.
       */
      intelligencePriority: external_exports.optional(external_exports.number().min(0).max(1))
    }).passthrough();
    SamplingMessageSchema = external_exports.object({
      role: external_exports.enum(["user", "assistant"]),
      content: external_exports.union([TextContentSchema, ImageContentSchema])
    }).passthrough();
    CreateMessageRequestSchema = RequestSchema.extend({
      method: external_exports.literal("sampling/createMessage"),
      params: BaseRequestParamsSchema.extend({
        messages: external_exports.array(SamplingMessageSchema),
        /**
         * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
         */
        systemPrompt: external_exports.optional(external_exports.string()),
        /**
         * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.
         */
        includeContext: external_exports.optional(external_exports.enum(["none", "thisServer", "allServers"])),
        temperature: external_exports.optional(external_exports.number()),
        /**
         * The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.
         */
        maxTokens: external_exports.number().int(),
        stopSequences: external_exports.optional(external_exports.array(external_exports.string())),
        /**
         * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
         */
        metadata: external_exports.optional(external_exports.object({}).passthrough()),
        /**
         * The server's preferences for which model to select.
         */
        modelPreferences: external_exports.optional(ModelPreferencesSchema)
      })
    });
    CreateMessageResultSchema = ResultSchema.extend({
      /**
       * The name of the model that generated the message.
       */
      model: external_exports.string(),
      /**
       * The reason why sampling stopped.
       */
      stopReason: external_exports.optional(external_exports.enum(["endTurn", "stopSequence", "maxTokens"]).or(external_exports.string())),
      role: external_exports.enum(["user", "assistant"]),
      content: external_exports.discriminatedUnion("type", [
        TextContentSchema,
        ImageContentSchema
      ])
    });
    ResourceReferenceSchema = external_exports.object({
      type: external_exports.literal("ref/resource"),
      /**
       * The URI or URI template of the resource.
       */
      uri: external_exports.string()
    }).passthrough();
    PromptReferenceSchema = external_exports.object({
      type: external_exports.literal("ref/prompt"),
      /**
       * The name of the prompt or prompt template
       */
      name: external_exports.string()
    }).passthrough();
    CompleteRequestSchema = RequestSchema.extend({
      method: external_exports.literal("completion/complete"),
      params: BaseRequestParamsSchema.extend({
        ref: external_exports.union([PromptReferenceSchema, ResourceReferenceSchema]),
        /**
         * The argument's information
         */
        argument: external_exports.object({
          /**
           * The name of the argument
           */
          name: external_exports.string(),
          /**
           * The value of the argument to use for completion matching.
           */
          value: external_exports.string()
        }).passthrough()
      })
    });
    CompleteResultSchema = ResultSchema.extend({
      completion: external_exports.object({
        /**
         * An array of completion values. Must not exceed 100 items.
         */
        values: external_exports.array(external_exports.string()).max(100),
        /**
         * The total number of completion options available. This can exceed the number of values actually sent in the response.
         */
        total: external_exports.optional(external_exports.number().int()),
        /**
         * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
         */
        hasMore: external_exports.optional(external_exports.boolean())
      }).passthrough()
    });
    RootSchema = external_exports.object({
      /**
       * The URI identifying the root. This *must* start with file:// for now.
       */
      uri: external_exports.string().startsWith("file://"),
      /**
       * An optional name for the root.
       */
      name: external_exports.optional(external_exports.string())
    }).passthrough();
    ListRootsRequestSchema = RequestSchema.extend({
      method: external_exports.literal("roots/list")
    });
    ListRootsResultSchema = ResultSchema.extend({
      roots: external_exports.array(RootSchema)
    });
    RootsListChangedNotificationSchema = NotificationSchema.extend({
      method: external_exports.literal("notifications/roots/list_changed")
    });
    ClientRequestSchema = external_exports.union([
      PingRequestSchema,
      InitializeRequestSchema,
      CompleteRequestSchema,
      SetLevelRequestSchema,
      GetPromptRequestSchema,
      ListPromptsRequestSchema,
      ListResourcesRequestSchema,
      ListResourceTemplatesRequestSchema,
      ReadResourceRequestSchema,
      SubscribeRequestSchema,
      UnsubscribeRequestSchema,
      CallToolRequestSchema,
      ListToolsRequestSchema
    ]);
    ClientNotificationSchema = external_exports.union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      InitializedNotificationSchema,
      RootsListChangedNotificationSchema
    ]);
    ClientResultSchema = external_exports.union([
      EmptyResultSchema,
      CreateMessageResultSchema,
      ListRootsResultSchema
    ]);
    ServerRequestSchema = external_exports.union([
      PingRequestSchema,
      CreateMessageRequestSchema,
      ListRootsRequestSchema
    ]);
    ServerNotificationSchema = external_exports.union([
      CancelledNotificationSchema,
      ProgressNotificationSchema,
      LoggingMessageNotificationSchema,
      ResourceUpdatedNotificationSchema,
      ResourceListChangedNotificationSchema,
      ToolListChangedNotificationSchema,
      PromptListChangedNotificationSchema
    ]);
    ServerResultSchema = external_exports.union([
      EmptyResultSchema,
      InitializeResultSchema,
      CompleteResultSchema,
      GetPromptResultSchema,
      ListPromptsResultSchema,
      ListResourcesResultSchema,
      ListResourceTemplatesResultSchema,
      ReadResourceResultSchema,
      CallToolResultSchema,
      ListToolsResultSchema
    ]);
    McpError = class extends Error {
      constructor(code, message, data) {
        super(`MCP error ${code}: ${message}`);
        this.code = code;
        this.data = data;
      }
    };
  }
});

// dist/constants.js
var CACHE_CONFIG, COMMAND_CONFIG;
var init_constants = __esm({
  "dist/constants.js"() {
    "use strict";
    CACHE_CONFIG = {
      /** Maximum age of cached responses in milliseconds (30 minutes) */
      MAX_AGE_MS: 30 * 60 * 1e3,
      /** Maximum number of cache entries to store */
      MAX_ENTRIES: 100,
      /** Debounce timeout for persistence operations in milliseconds */
      PERSISTENCE_DEBOUNCE_MS: 1e3
    };
    COMMAND_CONFIG = {
      /** Default timeout for command execution in milliseconds (5 minutes) */
      DEFAULT_TIMEOUT_MS: 5 * 60 * 1e3,
      /** Default maximum buffer size for command output in bytes (10MB) */
      DEFAULT_MAX_BUFFER_BYTES: 10 * 1024 * 1024
    };
  }
});

// dist/utils/command.js
var command_exports = {};
__export(command_exports, {
  buildSimctlCommand: () => buildSimctlCommand,
  buildXcodebuildCommand: () => buildXcodebuildCommand,
  executeCommand: () => executeCommand,
  executeCommandSync: () => executeCommandSync,
  executeCommandWithArgs: () => executeCommandWithArgs,
  extractBuildErrors: () => extractBuildErrors,
  findXcodeProject: () => findXcodeProject,
  runCommand: () => runCommand
});
import { exec, execSync, spawn } from "child_process";
import { promisify } from "util";
async function executeCommand(command, options = {}) {
  const defaultOptions = {
    timeout: COMMAND_CONFIG.DEFAULT_TIMEOUT_MS,
    maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES,
    ...options
  };
  try {
    const { stdout, stderr } = await execAsync(command, defaultOptions);
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      code: 0
    };
  } catch (error) {
    const execError = error;
    if (execError.code === "ETIMEDOUT") {
      throw new McpError(ErrorCode.InternalError, `Command timed out after ${defaultOptions.timeout}ms: ${command}`);
    }
    return {
      stdout: execError.stdout?.trim() || "",
      stderr: execError.stderr?.trim() || execError.message || "",
      code: execError.code || 1
    };
  }
}
async function executeCommandWithArgs(command, args, options = {}) {
  const defaultOptions = {
    timeout: COMMAND_CONFIG.DEFAULT_TIMEOUT_MS,
    maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES,
    ...options
  };
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: defaultOptions.cwd,
      timeout: defaultOptions.timeout
    });
    let stdout = "";
    let stderr = "";
    let killed = false;
    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill();
      reject(new McpError(ErrorCode.InternalError, `Command timed out after ${defaultOptions.timeout}ms: ${command} ${args.join(" ")}`));
    }, defaultOptions.timeout);
    child.stdout?.on("data", (data) => {
      stdout += data.toString();
      if (stdout.length > defaultOptions.maxBuffer) {
        killed = true;
        child.kill();
        clearTimeout(timeoutId);
        reject(new McpError(ErrorCode.InternalError, `Command output exceeded max buffer size of ${defaultOptions.maxBuffer} bytes`));
      }
    });
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("close", (code) => {
      clearTimeout(timeoutId);
      if (!killed) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          code: code || 0
        });
      }
    });
    child.on("error", (error) => {
      clearTimeout(timeoutId);
      if (!killed) {
        reject(new McpError(ErrorCode.InternalError, `Failed to execute command: ${error.message}`));
      }
    });
  });
}
function executeCommandSync(command) {
  try {
    const stdout = execSync(command, {
      encoding: "utf8",
      maxBuffer: COMMAND_CONFIG.DEFAULT_MAX_BUFFER_BYTES
    });
    return {
      stdout: stdout.trim(),
      stderr: "",
      code: 0
    };
  } catch (error) {
    const execError = error;
    return {
      stdout: execError.stdout?.trim() || "",
      stderr: execError.stderr?.trim() || execError.message || "",
      code: execError.status || 1
    };
  }
}
function buildXcodebuildCommand(action, projectPath, options = {}) {
  const parts = ["xcodebuild"];
  if (options.workspace || projectPath.endsWith(".xcworkspace")) {
    parts.push("-workspace", `"${projectPath}"`);
  } else {
    parts.push("-project", `"${projectPath}"`);
  }
  if (options.scheme) {
    parts.push("-scheme", `"${options.scheme}"`);
  }
  if (options.configuration) {
    parts.push("-configuration", options.configuration);
  }
  if (options.destination) {
    parts.push("-destination", `"${options.destination}"`);
  }
  if (options.sdk) {
    parts.push("-sdk", options.sdk);
  }
  if (options.derivedDataPath) {
    parts.push("-derivedDataPath", `"${options.derivedDataPath}"`);
  }
  if (options.json) {
    parts.push("-json");
  }
  if (action) {
    parts.push(action);
  }
  return parts.join(" ");
}
function buildSimctlCommand(action, options = {}) {
  const parts = ["xcrun", "simctl"];
  parts.push(action);
  if (options.json && ["list"].includes(action)) {
    parts.push("-j");
  }
  if (options.deviceId && ["boot", "shutdown", "delete"].includes(action)) {
    parts.push(options.deviceId);
  }
  if (action === "create" && options.name && options.deviceType && options.runtime) {
    parts.push(`"${options.name}"`, options.deviceType, options.runtime);
  }
  return parts.join(" ");
}
async function runCommand(command, args, options) {
  return executeCommandWithArgs(command, args, options);
}
async function findXcodeProject(searchPath = ".") {
  try {
    const workspaceResult = await executeCommand(`find "${searchPath}" -maxdepth 2 -name "*.xcworkspace" -type d | head -1`, { timeout: 5e3 });
    if (workspaceResult.stdout) {
      return workspaceResult.stdout.trim();
    }
    const projectResult = await executeCommand(`find "${searchPath}" -maxdepth 2 -name "*.xcodeproj" -type d | head -1`, { timeout: 5e3 });
    if (projectResult.stdout) {
      return projectResult.stdout.trim();
    }
    return null;
  } catch {
    return null;
  }
}
function extractBuildErrors(output, maxLines = 10) {
  const lines = output.split("\n");
  const errors = [];
  for (const line of lines) {
    if (line.includes("error:") || line.includes("Error:") || line.includes("ERROR") || line.includes("warning:") || line.includes("fatal error")) {
      errors.push(line.trim());
      if (errors.length >= maxLines) {
        break;
      }
    }
  }
  return errors;
}
var execAsync;
var init_command = __esm({
  "dist/utils/command.js"() {
    "use strict";
    init_types2();
    init_constants();
    execAsync = promisify(exec);
  }
});

// dist/state/persistence.js
var PersistenceManager, persistenceManager;
var init_persistence = __esm({
  "dist/state/persistence.js"() {
    "use strict";
    PersistenceManager = class {
      enabled = false;
      /**
       * Check if persistence is currently enabled
       */
      isEnabled() {
        return this.enabled;
      }
      /**
       * Load state for a specific cache type
       * Currently returns null as persistence is not enabled
       */
      async loadState(_cacheType) {
        return null;
      }
      /**
       * Save state for a specific cache type
       * Currently a no-op as persistence is not enabled
       */
      async saveState(_cacheType, _data) {
      }
    };
    persistenceManager = new PersistenceManager();
  }
});

// dist/state/response-cache.js
var response_cache_exports = {};
__export(response_cache_exports, {
  ResponseCache: () => ResponseCache,
  createProgressiveSimulatorResponse: () => createProgressiveSimulatorResponse,
  extractBuildSummary: () => extractBuildSummary,
  extractSimulatorSummary: () => extractSimulatorSummary,
  extractTestSummary: () => extractTestSummary,
  responseCache: () => responseCache
});
import { randomUUID } from "crypto";
function extractBuildSummary(output, stderr, exitCode) {
  const lines = (output + "\n" + stderr).split("\n");
  const errors = lines.filter((line) => line.includes("error:") || line.includes("** BUILD FAILED **"));
  const warnings = lines.filter((line) => line.includes("warning:"));
  const successIndicators = lines.filter((line) => line.includes("** BUILD SUCCEEDED **") || line.includes("Build completed"));
  const timingMatch = output.match(/Total time: (\d+\.\d+) seconds/);
  const duration = timingMatch ? parseFloat(timingMatch[1]) : void 0;
  const targetMatch = output.match(/Building target (.+?) with configuration/);
  const target = targetMatch ? targetMatch[1] : void 0;
  return {
    success: exitCode === 0 && successIndicators.length > 0,
    exitCode,
    errorCount: errors.length,
    warningCount: warnings.length,
    duration,
    target,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    firstError: errors[0]?.trim(),
    buildSizeBytes: output.length + stderr.length
  };
}
function extractTestSummary(output, stderr, exitCode) {
  const lines = (output + "\n" + stderr).split("\n");
  const testResults = lines.filter((line) => line.includes("Test Suite") || line.includes("executed") || line.includes("passed") || line.includes("failed"));
  const completionMatch = output.match(/Test Suite .+ (passed|failed)/);
  const passed = completionMatch?.[1] === "passed";
  const testsRun = (output.match(/(\d+) tests?/g) || []).map((match) => parseInt(match.match(/(\d+)/)?.[1] || "0")).reduce((sum, count) => sum + count, 0);
  return {
    success: exitCode === 0 && passed,
    exitCode,
    testsRun,
    passed: passed ?? false,
    resultSummary: testResults.slice(-3)
    // Last few result lines
  };
}
function extractSimulatorSummary(cachedList) {
  const allDevices = Object.values(cachedList.devices).flat();
  const availableDevices = allDevices.filter((d) => d.isAvailable);
  const bootedDevices = availableDevices.filter((d) => d.state === "Booted");
  const deviceTypeCounts = /* @__PURE__ */ new Map();
  availableDevices.forEach((device) => {
    const type = extractDeviceType(device.name);
    deviceTypeCounts.set(type, (deviceTypeCounts.get(type) || 0) + 1);
  });
  const activeRuntimes = Object.keys(cachedList.devices).filter((runtime) => cachedList.devices[runtime].length > 0).map((runtime) => formatRuntimeName(runtime)).slice(0, 5);
  return {
    totalDevices: allDevices.length,
    availableDevices: availableDevices.length,
    bootedDevices: bootedDevices.length,
    deviceTypes: Array.from(deviceTypeCounts.keys()).slice(0, 5),
    commonRuntimes: activeRuntimes,
    lastUpdated: cachedList.lastUpdated,
    cacheAge: formatTimeAgo(cachedList.lastUpdated),
    bootedList: bootedDevices.map((d) => ({
      name: d.name,
      udid: d.udid,
      state: d.state,
      runtime: extractRuntimeFromDevice(d, cachedList)
    })),
    recentlyUsed: availableDevices.filter((d) => d.lastUsed).sort((a, b) => {
      const aTime = a.lastUsed?.getTime() ?? 0;
      const bTime = b.lastUsed?.getTime() ?? 0;
      return bTime - aTime;
    }).slice(0, 3).map((d) => ({
      name: d.name,
      udid: d.udid,
      lastUsed: formatTimeAgo(d.lastUsed || /* @__PURE__ */ new Date())
    }))
  };
}
function extractDeviceType(deviceName) {
  if (deviceName.includes("iPhone"))
    return "iPhone";
  if (deviceName.includes("iPad"))
    return "iPad";
  if (deviceName.includes("Apple Watch"))
    return "Apple Watch";
  if (deviceName.includes("Apple TV"))
    return "Apple TV";
  if (deviceName.includes("Vision"))
    return "Apple Vision Pro";
  return "Other";
}
function formatRuntimeName(runtime) {
  const match = runtime.match(/iOS-(\d+)-(\d+)/);
  if (match) {
    return `iOS ${match[1]}.${match[2]}`;
  }
  if (runtime.includes("iOS")) {
    return runtime.replace("com.apple.CoreSimulator.SimRuntime.", "").replace(/-/g, " ");
  }
  return runtime;
}
function extractRuntimeFromDevice(device, cachedList) {
  for (const [runtimeKey, devices] of Object.entries(cachedList.devices)) {
    if (devices.some((d) => d.udid === device.udid)) {
      return formatRuntimeName(runtimeKey);
    }
  }
  return "Unknown";
}
function formatTimeAgo(date) {
  const now = /* @__PURE__ */ new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const minutes = Math.floor(diffMs / (1e3 * 60));
  const hours = Math.floor(diffMs / (1e3 * 60 * 60));
  const days = Math.floor(diffMs / (1e3 * 60 * 60 * 24));
  if (days > 0)
    return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}
function createProgressiveSimulatorResponse(summary, cacheId, filters) {
  return {
    cacheId,
    summary: {
      totalDevices: summary.totalDevices,
      availableDevices: summary.availableDevices,
      bootedDevices: summary.bootedDevices,
      deviceTypes: summary.deviceTypes,
      commonRuntimes: summary.commonRuntimes,
      lastUpdated: summary.lastUpdated.toISOString(),
      cacheAge: summary.cacheAge
    },
    quickAccess: {
      bootedDevices: summary.bootedList,
      recentlyUsed: summary.recentlyUsed,
      recommendedForBuild: summary.bootedList.length > 0 ? [summary.bootedList[0]] : summary.recentlyUsed.slice(0, 1)
    },
    nextSteps: [
      `\u2705 Found ${summary.availableDevices} available simulators`,
      `Use 'simctl-get-details' with cacheId for full device list`,
      `Use filters: deviceType=${filters.deviceType || "iPhone"}, runtime=${filters.runtime || "iOS 18.5"}`
    ],
    availableDetails: ["full-list", "devices-only", "runtimes-only", "available-only"],
    smartFilters: {
      commonDeviceTypes: ["iPhone", "iPad"],
      commonRuntimes: summary.commonRuntimes.slice(0, 2),
      suggestedFilters: `deviceType=iPhone runtime='${summary.commonRuntimes[0] || "iOS 18.5"}'`
    }
  };
}
var ResponseCache, responseCache;
var init_response_cache = __esm({
  "dist/state/response-cache.js"() {
    "use strict";
    init_persistence();
    init_constants();
    ResponseCache = class {
      cache = /* @__PURE__ */ new Map();
      maxAge = CACHE_CONFIG.MAX_AGE_MS;
      maxEntries = CACHE_CONFIG.MAX_ENTRIES;
      constructor() {
        this.loadPersistedState().catch((error) => {
          console.warn("Failed to load response cache state:", error);
        });
      }
      store(data) {
        const id = randomUUID();
        const cached = {
          ...data,
          id,
          timestamp: /* @__PURE__ */ new Date()
        };
        this.cache.set(id, cached);
        this.cleanup();
        this.persistStateDebounced();
        return id;
      }
      get(id) {
        const cached = this.cache.get(id);
        if (!cached)
          return void 0;
        if (Date.now() - cached.timestamp.getTime() > this.maxAge) {
          this.cache.delete(id);
          return void 0;
        }
        return cached;
      }
      getRecentByTool(tool, limit = 5) {
        return Array.from(this.cache.values()).filter((c) => c.tool === tool).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
      }
      delete(id) {
        return this.cache.delete(id);
      }
      clear() {
        this.cache.clear();
        this.persistStateDebounced();
      }
      cleanup() {
        const now = Date.now();
        for (const [id, cached] of this.cache) {
          if (now - cached.timestamp.getTime() > this.maxAge) {
            this.cache.delete(id);
          }
        }
        if (this.cache.size > this.maxEntries) {
          const entries = Array.from(this.cache.entries()).sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());
          const toRemove = entries.slice(0, this.cache.size - this.maxEntries);
          for (const [id] of toRemove) {
            this.cache.delete(id);
          }
        }
      }
      getStats() {
        const byTool = {};
        for (const cached of this.cache.values()) {
          byTool[cached.tool] = (byTool[cached.tool] || 0) + 1;
        }
        return {
          totalEntries: this.cache.size,
          byTool
        };
      }
      /**
       * Load persisted state from disk
       */
      async loadPersistedState() {
        if (!persistenceManager.isEnabled())
          return;
        try {
          const data = await persistenceManager.loadState("responses");
          if (data) {
            this.cache = new Map(data.cache || []);
            this.cleanup();
          }
        } catch (error) {
          console.warn("Failed to load response cache state:", error);
        }
      }
      /**
       * Persist state to disk with debouncing
       */
      saveStateTimeout = null;
      persistStateDebounced() {
        if (!persistenceManager.isEnabled())
          return;
        if (this.saveStateTimeout) {
          clearTimeout(this.saveStateTimeout);
        }
        this.saveStateTimeout = setTimeout(async () => {
          try {
            await persistenceManager.saveState("responses", {
              cache: Array.from(this.cache.entries())
            });
            this.saveStateTimeout = null;
          } catch (error) {
            console.warn("Failed to persist response cache state:", error);
          }
        }, CACHE_CONFIG.PERSISTENCE_DEBOUNCE_MS);
      }
    };
    responseCache = new ResponseCache();
  }
});

// ../node_modules/@modelcontextprotocol/sdk/dist/shared/protocol.js
init_types2();
var Protocol = class {
  constructor(_options) {
    this._options = _options;
    this._requestMessageId = 0;
    this._requestHandlers = /* @__PURE__ */ new Map();
    this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
    this._notificationHandlers = /* @__PURE__ */ new Map();
    this._responseHandlers = /* @__PURE__ */ new Map();
    this._progressHandlers = /* @__PURE__ */ new Map();
    this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
      const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
      controller === null || controller === void 0 ? void 0 : controller.abort(notification.params.reason);
    });
    this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
      this._onprogress(notification);
    });
    this.setRequestHandler(
      PingRequestSchema,
      // Automatic pong by default.
      (_request) => ({})
    );
  }
  /**
   * Attaches to the given transport, starts it, and starts listening for messages.
   *
   * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
   */
  async connect(transport) {
    this._transport = transport;
    this._transport.onclose = () => {
      this._onclose();
    };
    this._transport.onerror = (error) => {
      this._onerror(error);
    };
    this._transport.onmessage = (message) => {
      if (!("method" in message)) {
        this._onresponse(message);
      } else if ("id" in message) {
        this._onrequest(message);
      } else {
        this._onnotification(message);
      }
    };
    await this._transport.start();
  }
  _onclose() {
    var _a;
    const responseHandlers = this._responseHandlers;
    this._responseHandlers = /* @__PURE__ */ new Map();
    this._progressHandlers.clear();
    this._transport = void 0;
    (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
    const error = new McpError(ErrorCode.ConnectionClosed, "Connection closed");
    for (const handler of responseHandlers.values()) {
      handler(error);
    }
  }
  _onerror(error) {
    var _a;
    (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, error);
  }
  _onnotification(notification) {
    var _a;
    const handler = (_a = this._notificationHandlers.get(notification.method)) !== null && _a !== void 0 ? _a : this.fallbackNotificationHandler;
    if (handler === void 0) {
      return;
    }
    Promise.resolve().then(() => handler(notification)).catch((error) => this._onerror(new Error(`Uncaught error in notification handler: ${error}`)));
  }
  _onrequest(request) {
    var _a, _b;
    const handler = (_a = this._requestHandlers.get(request.method)) !== null && _a !== void 0 ? _a : this.fallbackRequestHandler;
    if (handler === void 0) {
      (_b = this._transport) === null || _b === void 0 ? void 0 : _b.send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: ErrorCode.MethodNotFound,
          message: "Method not found"
        }
      }).catch((error) => this._onerror(new Error(`Failed to send an error response: ${error}`)));
      return;
    }
    const abortController = new AbortController();
    this._requestHandlerAbortControllers.set(request.id, abortController);
    Promise.resolve().then(() => handler(request, { signal: abortController.signal })).then((result) => {
      var _a2;
      if (abortController.signal.aborted) {
        return;
      }
      return (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send({
        result,
        jsonrpc: "2.0",
        id: request.id
      });
    }, (error) => {
      var _a2, _b2;
      if (abortController.signal.aborted) {
        return;
      }
      return (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: Number.isSafeInteger(error["code"]) ? error["code"] : ErrorCode.InternalError,
          message: (_b2 = error.message) !== null && _b2 !== void 0 ? _b2 : "Internal error"
        }
      });
    }).catch((error) => this._onerror(new Error(`Failed to send response: ${error}`))).finally(() => {
      this._requestHandlerAbortControllers.delete(request.id);
    });
  }
  _onprogress(notification) {
    const { progress, total, progressToken } = notification.params;
    const handler = this._progressHandlers.get(Number(progressToken));
    if (handler === void 0) {
      this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
      return;
    }
    handler({ progress, total });
  }
  _onresponse(response) {
    const messageId = response.id;
    const handler = this._responseHandlers.get(Number(messageId));
    if (handler === void 0) {
      this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
      return;
    }
    this._responseHandlers.delete(Number(messageId));
    this._progressHandlers.delete(Number(messageId));
    if ("result" in response) {
      handler(response);
    } else {
      const error = new McpError(response.error.code, response.error.message, response.error.data);
      handler(error);
    }
  }
  get transport() {
    return this._transport;
  }
  /**
   * Closes the connection.
   */
  async close() {
    var _a;
    await ((_a = this._transport) === null || _a === void 0 ? void 0 : _a.close());
  }
  /**
   * Sends a request and wait for a response.
   *
   * Do not use this method to emit notifications! Use notification() instead.
   */
  request(request, resultSchema, options) {
    return new Promise((resolve, reject) => {
      var _a, _b, _c;
      if (!this._transport) {
        reject(new Error("Not connected"));
        return;
      }
      if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.enforceStrictCapabilities) === true) {
        this.assertCapabilityForMethod(request.method);
      }
      (_b = options === null || options === void 0 ? void 0 : options.signal) === null || _b === void 0 ? void 0 : _b.throwIfAborted();
      const messageId = this._requestMessageId++;
      const jsonrpcRequest = {
        ...request,
        jsonrpc: "2.0",
        id: messageId
      };
      if (options === null || options === void 0 ? void 0 : options.onprogress) {
        this._progressHandlers.set(messageId, options.onprogress);
        jsonrpcRequest.params = {
          ...request.params,
          _meta: { progressToken: messageId }
        };
      }
      this._responseHandlers.set(messageId, (response) => {
        var _a2;
        if ((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.aborted) {
          return;
        }
        if (response instanceof Error) {
          return reject(response);
        }
        try {
          const result = resultSchema.parse(response.result);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      (_c = options === null || options === void 0 ? void 0 : options.signal) === null || _c === void 0 ? void 0 : _c.addEventListener("abort", () => {
        var _a2, _b2;
        const reason = (_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.reason;
        this._responseHandlers.delete(messageId);
        this._progressHandlers.delete(messageId);
        (_b2 = this._transport) === null || _b2 === void 0 ? void 0 : _b2.send({
          jsonrpc: "2.0",
          method: "cancelled",
          params: {
            requestId: messageId,
            reason: String(reason)
          }
        });
        reject(reason);
      });
      this._transport.send(jsonrpcRequest).catch(reject);
    });
  }
  /**
   * Emits a notification, which is a one-way message that does not expect a response.
   */
  async notification(notification) {
    if (!this._transport) {
      throw new Error("Not connected");
    }
    this.assertNotificationCapability(notification.method);
    const jsonrpcNotification = {
      ...notification,
      jsonrpc: "2.0"
    };
    await this._transport.send(jsonrpcNotification);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a request with the given method.
   *
   * Note that this will replace any previous request handler for the same method.
   */
  setRequestHandler(requestSchema, handler) {
    const method = requestSchema.shape.method.value;
    this.assertRequestHandlerCapability(method);
    this._requestHandlers.set(method, (request, extra) => Promise.resolve(handler(requestSchema.parse(request), extra)));
  }
  /**
   * Removes the request handler for the given method.
   */
  removeRequestHandler(method) {
    this._requestHandlers.delete(method);
  }
  /**
   * Registers a handler to invoke when this protocol object receives a notification with the given method.
   *
   * Note that this will replace any previous notification handler for the same method.
   */
  setNotificationHandler(notificationSchema, handler) {
    this._notificationHandlers.set(notificationSchema.shape.method.value, (notification) => Promise.resolve(handler(notificationSchema.parse(notification))));
  }
  /**
   * Removes the notification handler for the given method.
   */
  removeNotificationHandler(method) {
    this._notificationHandlers.delete(method);
  }
};

// ../node_modules/@modelcontextprotocol/sdk/dist/server/index.js
init_types2();
var Server = class extends Protocol {
  /**
   * Initializes this server with the given name and version information.
   */
  constructor(_serverInfo, options) {
    super(options);
    this._serverInfo = _serverInfo;
    this._capabilities = options.capabilities;
    this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
    this.setNotificationHandler(InitializedNotificationSchema, () => {
      var _a;
      return (_a = this.oninitialized) === null || _a === void 0 ? void 0 : _a.call(this);
    });
  }
  assertCapabilityForMethod(method) {
    var _a, _b;
    switch (method) {
      case "sampling/createMessage":
        if (!((_a = this._clientCapabilities) === null || _a === void 0 ? void 0 : _a.sampling)) {
          throw new Error(`Client does not support sampling (required for ${method})`);
        }
        break;
      case "roots/list":
        if (!((_b = this._clientCapabilities) === null || _b === void 0 ? void 0 : _b.roots)) {
          throw new Error(`Client does not support listing roots (required for ${method})`);
        }
        break;
      case "ping":
        break;
    }
  }
  assertNotificationCapability(method) {
    switch (method) {
      case "notifications/message":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "notifications/resources/updated":
      case "notifications/resources/list_changed":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support notifying about resources (required for ${method})`);
        }
        break;
      case "notifications/tools/list_changed":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
        }
        break;
      case "notifications/prompts/list_changed":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
        }
        break;
      case "notifications/cancelled":
        break;
      case "notifications/progress":
        break;
    }
  }
  assertRequestHandlerCapability(method) {
    switch (method) {
      case "sampling/createMessage":
        if (!this._capabilities.sampling) {
          throw new Error(`Server does not support sampling (required for ${method})`);
        }
        break;
      case "logging/setLevel":
        if (!this._capabilities.logging) {
          throw new Error(`Server does not support logging (required for ${method})`);
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._capabilities.prompts) {
          throw new Error(`Server does not support prompts (required for ${method})`);
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
        if (!this._capabilities.resources) {
          throw new Error(`Server does not support resources (required for ${method})`);
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error(`Server does not support tools (required for ${method})`);
        }
        break;
      case "ping":
      case "initialize":
        break;
    }
  }
  async _oninitialize(request) {
    const requestedVersion = request.params.protocolVersion;
    this._clientCapabilities = request.params.capabilities;
    this._clientVersion = request.params.clientInfo;
    return {
      protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION,
      capabilities: this.getCapabilities(),
      serverInfo: this._serverInfo
    };
  }
  /**
   * After initialization has completed, this will be populated with the client's reported capabilities.
   */
  getClientCapabilities() {
    return this._clientCapabilities;
  }
  /**
   * After initialization has completed, this will be populated with information about the client's name and version.
   */
  getClientVersion() {
    return this._clientVersion;
  }
  getCapabilities() {
    return this._capabilities;
  }
  async ping() {
    return this.request({ method: "ping" }, EmptyResultSchema);
  }
  async createMessage(params, options) {
    return this.request({ method: "sampling/createMessage", params }, CreateMessageResultSchema, options);
  }
  async listRoots(params, options) {
    return this.request({ method: "roots/list", params }, ListRootsResultSchema, options);
  }
  async sendLoggingMessage(params) {
    return this.notification({ method: "notifications/message", params });
  }
  async sendResourceUpdated(params) {
    return this.notification({
      method: "notifications/resources/updated",
      params
    });
  }
  async sendResourceListChanged() {
    return this.notification({
      method: "notifications/resources/list_changed"
    });
  }
  async sendToolListChanged() {
    return this.notification({ method: "notifications/tools/list_changed" });
  }
  async sendPromptListChanged() {
    return this.notification({ method: "notifications/prompts/list_changed" });
  }
};

// ../node_modules/@modelcontextprotocol/sdk/dist/server/stdio.js
import process2 from "node:process";

// ../node_modules/@modelcontextprotocol/sdk/dist/shared/stdio.js
init_types2();
var ReadBuffer = class {
  append(chunk) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const index = this._buffer.indexOf("\n");
    if (index === -1) {
      return null;
    }
    const line = this._buffer.toString("utf8", 0, index);
    this._buffer = this._buffer.subarray(index + 1);
    return deserializeMessage(line);
  }
  clear() {
    this._buffer = void 0;
  }
};
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}

// ../node_modules/@modelcontextprotocol/sdk/dist/server/stdio.js
var StdioServerTransport = class {
  constructor(_stdin = process2.stdin, _stdout = process2.stdout) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._readBuffer = new ReadBuffer();
    this._started = false;
    this._ondata = (chunk) => {
      this._readBuffer.append(chunk);
      this.processReadBuffer();
    };
    this._onerror = (error) => {
      var _a;
      (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, error);
    };
  }
  /**
   * Starts listening for messages on stdin.
   */
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    var _a, _b;
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        (_a = this.onmessage) === null || _a === void 0 ? void 0 : _a.call(this, message);
      } catch (error) {
        (_b = this.onerror) === null || _b === void 0 ? void 0 : _b.call(this, error);
      }
    }
  }
  async close() {
    var _a;
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    this._readBuffer.clear();
    (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
  }
  send(message) {
    return new Promise((resolve) => {
      const json = serializeMessage(message);
      if (this._stdout.write(json)) {
        resolve();
      } else {
        this._stdout.once("drain", resolve);
      }
    });
  }
};

// dist/index.js
init_types2();

// dist/dispatchers/base.js
var BaseDispatcher = class {
  /**
   * Format error response
   *
   * @param error - Error object or message
   * @param operation - Optional operation name for context
   * @returns Formatted error result
   */
  formatError(error, operation) {
    const message = error instanceof Error ? error.message : error;
    return {
      success: false,
      error: message,
      ...operation && { operation }
    };
  }
  /**
   * Format success response
   *
   * @param data - Operation result data
   * @param summary - Optional human-readable summary
   * @returns Formatted success result
   */
  formatSuccess(data, summary) {
    return {
      success: true,
      data,
      ...summary && { summary }
    };
  }
};

// dist/utils/logger.js
var LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
var Logger = class {
  level;
  constructor() {
    const envLevel = process.env.XC_LOG_LEVEL?.toLowerCase() || "info";
    this.level = envLevel in LOG_LEVELS ? envLevel : "info";
  }
  shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }
  formatMessage(level, message, data) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    if (data !== void 0) {
      const dataStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
      return `${prefix} ${message}
${dataStr}`;
    }
    return `${prefix} ${message}`;
  }
  /**
   * Log debug message (only if log level is debug)
   *
   * @param message - Log message
   * @param data - Optional structured data
   */
  debug(message, data) {
    if (this.shouldLog("debug")) {
      console.error(this.formatMessage("debug", message, data));
    }
  }
  /**
   * Log info message
   *
   * @param message - Log message
   * @param data - Optional structured data
   */
  info(message, data) {
    if (this.shouldLog("info")) {
      console.error(this.formatMessage("info", message, data));
    }
  }
  /**
   * Log warning message
   *
   * @param message - Log message
   * @param data - Optional structured data
   */
  warn(message, data) {
    if (this.shouldLog("warn")) {
      console.error(this.formatMessage("warn", message, data));
    }
  }
  /**
   * Log error message
   *
   * @param message - Log message
   * @param data - Optional structured data or Error object
   */
  error(message, data) {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, data));
    }
  }
};
var logger = new Logger();

// dist/dispatchers/xcode.js
var XcodeDispatcher = class extends BaseDispatcher {
  getToolDefinition() {
    return {
      name: "execute_xcode_command",
      description: "Execute Xcode build system operations. Use xcode-workflows Skill for guidance on when/how to use operations.",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["build", "clean", "test", "list", "version"],
            description: "Operation: build (compile project), clean (remove artifacts), test (run tests), list (show schemes/targets), version (Xcode info)"
          },
          project_path: {
            type: "string",
            description: "Path to .xcodeproj or .xcworkspace (auto-detected if omitted)"
          },
          scheme: {
            type: "string",
            description: "Scheme name (required for build/test)"
          },
          configuration: {
            type: "string",
            enum: ["Debug", "Release"],
            description: "Build configuration (default: Debug)"
          },
          destination: {
            type: "string",
            description: 'Build destination, e.g. "platform=iOS Simulator,name=iPhone 15"'
          },
          options: {
            type: "object",
            description: "Additional options (clean_before_build, parallel, quiet, sdk, arch, etc.)"
          }
        },
        required: ["operation"]
      }
    };
  }
  async execute(args) {
    const { operation, project_path, scheme, configuration, destination, options } = args;
    logger.info(`Executing xcode operation: ${operation}`);
    try {
      switch (operation) {
        case "build":
          if (!scheme) {
            return this.formatError("scheme required for build", operation);
          }
          return await this.executeBuild({
            project_path,
            scheme,
            configuration: configuration || "Debug",
            destination,
            options
          });
        case "clean":
          return await this.executeClean({ project_path, scheme });
        case "test":
          if (!scheme) {
            return this.formatError("scheme required for test", operation);
          }
          return await this.executeTest({
            project_path,
            scheme,
            destination,
            options
          });
        case "list":
          return await this.executeList({ project_path });
        case "version":
          return await this.executeVersion();
        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`Xcode operation failed: ${operation}`, error);
      return this.formatError(error, operation);
    }
  }
  async executeBuild(params) {
    try {
      const { runCommand: runCommand2, findXcodeProject: findXcodeProject2, extractBuildErrors: extractBuildErrors2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const { ResponseCache: ResponseCache2 } = await Promise.resolve().then(() => (init_response_cache(), response_cache_exports));
      const projectPath = params.project_path || await findXcodeProject2();
      if (!projectPath) {
        return this.formatError("No Xcode project found", "build");
      }
      const args = [
        "-scheme",
        params.scheme || "",
        "-configuration",
        params.configuration || "Debug"
      ];
      if (projectPath.endsWith(".xcworkspace")) {
        args.unshift("-workspace", projectPath);
      } else {
        args.unshift("-project", projectPath);
      }
      if (params.destination) {
        args.push("-destination", params.destination);
      }
      args.push("build");
      const startTime = Date.now();
      const result = await runCommand2("xcodebuild", args);
      const duration = ((Date.now() - startTime) / 1e3).toFixed(1);
      const cache = new ResponseCache2();
      const cacheId = cache.store({
        tool: "xcode-build",
        fullOutput: result.stdout,
        stderr: result.stderr,
        exitCode: result.code,
        command: `xcodebuild ${args.join(" ")}`,
        metadata: {
          projectPath,
          scheme: params.scheme || "",
          configuration: params.configuration || "Debug",
          destination: params.destination || null,
          duration,
          success: result.code === 0
        }
      });
      const errors = result.code !== 0 ? extractBuildErrors2(result.stdout + "\n" + result.stderr) : void 0;
      const data = {
        message: `Build ${result.code === 0 ? "succeeded" : "failed"} in ${duration}s`,
        note: `Full output available via cache_id: ${cacheId}`,
        params,
        errors,
        cache_id: cacheId
      };
      const summary = `Build ${result.code === 0 ? "succeeded" : "failed"}. ${errors ? `${errors.length} error(s) detected.` : ""} cache_id: ${cacheId}`;
      return this.formatSuccess(data, summary);
    } catch (error) {
      logger.error("Build failed", error);
      return this.formatError(error, "build");
    }
  }
  async executeClean(params) {
    try {
      const { runCommand: runCommand2, findXcodeProject: findXcodeProject2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const projectPath = params.project_path || await findXcodeProject2();
      if (!projectPath) {
        return this.formatError("No Xcode project found", "clean");
      }
      const args = [];
      if (projectPath.endsWith(".xcworkspace")) {
        args.push("-workspace", projectPath);
      } else {
        args.push("-project", projectPath);
      }
      if (params.scheme) {
        args.push("-scheme", params.scheme);
      }
      args.push("clean");
      const result = await runCommand2("xcodebuild", args);
      const data = {
        message: "Clean completed successfully",
        note: result.stdout.includes("CLEAN SUCCEEDED") ? "Build artifacts removed" : void 0,
        params
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Clean operation failed", error);
      return this.formatError(error, "clean");
    }
  }
  async executeTest(params) {
    try {
      const { runCommand: runCommand2, findXcodeProject: findXcodeProject2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const { ResponseCache: ResponseCache2 } = await Promise.resolve().then(() => (init_response_cache(), response_cache_exports));
      const projectPath = params.project_path || await findXcodeProject2();
      if (!projectPath) {
        return this.formatError("No Xcode project found", "test");
      }
      const args = ["-scheme", params.scheme || ""];
      if (projectPath.endsWith(".xcworkspace")) {
        args.unshift("-workspace", projectPath);
      } else {
        args.unshift("-project", projectPath);
      }
      if (params.destination) {
        args.push("-destination", params.destination);
      }
      const testOpts = params.options;
      if (testOpts?.test_plan) {
        args.push("-testPlan", testOpts.test_plan);
      }
      if (testOpts?.only_testing) {
        testOpts.only_testing.forEach((test) => {
          args.push("-only-testing", test);
        });
      }
      args.push("test");
      const startTime = Date.now();
      const result = await runCommand2("xcodebuild", args);
      const duration = ((Date.now() - startTime) / 1e3).toFixed(1);
      const output = result.stdout;
      const passedMatch = output.match(/Test Suite .* passed at .*/);
      const failedMatch = output.match(/(\d+) tests?, (\d+) failures?/);
      const cache = new ResponseCache2();
      const cacheId = cache.store({
        tool: "xcode-test",
        fullOutput: output,
        stderr: result.stderr,
        exitCode: result.code,
        command: `xcodebuild ${args.join(" ")}`,
        metadata: {
          projectPath,
          scheme: params.scheme || "",
          destination: params.destination || null,
          duration,
          success: result.code === 0
        }
      });
      const data = {
        message: passedMatch ? `Tests passed in ${duration}s` : failedMatch ? `Tests completed: ${failedMatch[1]} tests, ${failedMatch[2]} failures` : `Tests completed in ${duration}s`,
        params
      };
      return this.formatSuccess(data, `Test results cached. cache_id: ${cacheId}`);
    } catch (error) {
      logger.error("Test execution failed", error);
      return this.formatError(error, "test");
    }
  }
  async executeList(_params) {
    try {
      const { runCommand: runCommand2, findXcodeProject: findXcodeProject2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const projectPath = _params.project_path || await findXcodeProject2();
      if (!projectPath) {
        return this.formatError("No Xcode project found", "list");
      }
      const args = ["-list"];
      if (projectPath.endsWith(".xcworkspace")) {
        args.push("-workspace", projectPath);
      } else {
        args.push("-project", projectPath);
      }
      const result = await runCommand2("xcodebuild", args);
      const output = result.stdout;
      const schemesMatch = output.match(/Schemes:\s*([\s\S]*?)(?=\n\n|Build Configurations:|$)/);
      const targetsMatch = output.match(/Targets:\s*([\s\S]*?)(?=\n\n|Build Configurations:|Schemes:|$)/);
      const schemes = schemesMatch ? schemesMatch[1].trim().split("\n").map((s) => s.trim()).filter(Boolean) : [];
      const targets = targetsMatch ? targetsMatch[1].trim().split("\n").map((t) => t.trim()).filter(Boolean) : [];
      const data = {
        schemes,
        targets,
        message: `Found ${schemes.length} schemes and ${targets.length} targets`
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("List operation failed", error);
      return this.formatError(error, "list");
    }
  }
  async executeVersion() {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const result = await executeCommand2("xcodebuild -version");
      const lines = result.stdout.trim().split("\n");
      const versionMatch = lines[0]?.match(/Xcode\s+([\d.]+)/);
      const buildMatch = lines[1]?.match(/Build\s+version\s+(.+)/);
      const data = {
        xcode_version: versionMatch ? versionMatch[1] : void 0,
        build_number: buildMatch ? buildMatch[1] : void 0,
        message: result.stdout.trim()
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Version check failed", error);
      return this.formatError(error, "version");
    }
  }
};

// dist/dispatchers/simulator.js
var SimulatorDispatcher = class extends BaseDispatcher {
  getToolDefinition() {
    return {
      name: "execute_simulator_command",
      description: "Control iOS Simulator devices and apps. Use simulator-workflows Skill for device management guidance.",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: [
              "device-lifecycle",
              "app-lifecycle",
              "io",
              "push",
              "openurl",
              "list",
              "health-check",
              "get-app-container"
            ],
            description: "Operation category: device-lifecycle (boot/shutdown/create/delete), app-lifecycle (install/launch/terminate), io (screenshot/video), push (notifications), openurl, list (devices), health-check (validate environment), get-app-container (app paths)"
          },
          device_id: {
            type: "string",
            description: 'Device UDID or name (e.g. "iPhone 15" or full UDID)'
          },
          sub_operation: {
            type: "string",
            description: "Specific action within operation: boot, shutdown, create, delete, erase, clone, install, uninstall, launch, terminate, screenshot, video"
          },
          app_identifier: {
            type: "string",
            description: 'App bundle identifier (e.g. "com.example.MyApp")'
          },
          parameters: {
            type: "object",
            description: "Operation-specific parameters (device_type, runtime, app_path, url, etc.)"
          }
        },
        required: ["operation"]
      }
    };
  }
  async execute(args) {
    const { operation, device_id, sub_operation, app_identifier, parameters } = args;
    logger.info(`Executing simulator operation: ${operation} / ${sub_operation || "default"}`);
    try {
      switch (operation) {
        case "device-lifecycle":
          if (!sub_operation) {
            return this.formatError("sub_operation required for device-lifecycle", operation);
          }
          return await this.executeDeviceLifecycle({
            device_id,
            sub_operation,
            parameters
          });
        case "app-lifecycle":
          if (!sub_operation || !app_identifier) {
            return this.formatError("sub_operation and app_identifier required for app-lifecycle", operation);
          }
          return await this.executeAppLifecycle({
            device_id,
            app_identifier,
            sub_operation,
            parameters
          });
        case "io":
          if (!sub_operation) {
            return this.formatError("sub_operation required for io", operation);
          }
          return await this.executeIO({
            device_id,
            sub_operation,
            parameters
          });
        case "push":
          if (!app_identifier) {
            return this.formatError("app_identifier required for push", operation);
          }
          return await this.executePush({
            device_id,
            app_identifier,
            parameters
          });
        case "openurl":
          if (!parameters?.url) {
            return this.formatError("url required in parameters for openurl", operation);
          }
          return await this.executeOpenURL({
            device_id,
            parameters: { url: parameters.url }
          });
        case "list":
          return await this.executeList(parameters);
        case "health-check":
          return await this.executeHealthCheck();
        case "get-app-container":
          if (!device_id || !app_identifier) {
            return this.formatError("device_id and app_identifier required for get-app-container", operation);
          }
          return await this.executeGetAppContainer({
            device_id,
            app_identifier,
            parameters
          });
        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`Simulator operation failed: ${operation}`, error);
      return this.formatError(error, operation);
    }
  }
  async executeDeviceLifecycle(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const subOp = params.sub_operation;
      switch (subOp) {
        case "boot": {
          if (!params.device_id) {
            return this.formatError("device_id required for boot", "device-lifecycle");
          }
          await runCommand2("xcrun", ["simctl", "boot", params.device_id]);
          const data = {
            message: `Device ${params.device_id} booted successfully`,
            sub_operation: "boot",
            device_id: params.device_id,
            status: "Booted"
          };
          return this.formatSuccess(data);
        }
        case "shutdown": {
          const deviceId = params.device_id || "booted";
          await runCommand2("xcrun", ["simctl", "shutdown", deviceId]);
          const data = {
            message: `Device ${deviceId} shut down successfully`,
            sub_operation: "shutdown",
            device_id: deviceId,
            status: "Shutdown"
          };
          return this.formatSuccess(data);
        }
        case "create": {
          const name = params.parameters?.new_name || "New Device";
          const deviceType = params.parameters?.device_type || "iPhone 15";
          const runtime = params.parameters?.runtime || "iOS 17.0";
          const result = await runCommand2("xcrun", ["simctl", "create", name, deviceType, runtime]);
          const udid = result.stdout.trim();
          const data = {
            message: `Created device: ${name}`,
            sub_operation: "create",
            device_id: udid,
            note: `Device UDID: ${udid}`
          };
          return this.formatSuccess(data);
        }
        case "delete": {
          if (!params.device_id) {
            return this.formatError("device_id required for delete", "device-lifecycle");
          }
          await runCommand2("xcrun", ["simctl", "delete", params.device_id]);
          const data = {
            message: `Device ${params.device_id} deleted successfully`,
            sub_operation: "delete",
            device_id: params.device_id
          };
          return this.formatSuccess(data);
        }
        case "erase": {
          if (!params.device_id) {
            return this.formatError("device_id required for erase", "device-lifecycle");
          }
          await runCommand2("xcrun", ["simctl", "erase", params.device_id]);
          const data = {
            message: `Device ${params.device_id} erased successfully`,
            sub_operation: "erase",
            device_id: params.device_id
          };
          return this.formatSuccess(data);
        }
        default:
          return this.formatError(`Unknown sub_operation: ${subOp}`, "device-lifecycle");
      }
    } catch (error) {
      logger.error("Device lifecycle operation failed", error);
      return this.formatError(error, "device-lifecycle");
    }
  }
  async executeAppLifecycle(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const subOp = params.sub_operation;
      const deviceId = params.device_id || "booted";
      switch (subOp) {
        case "install": {
          if (!params.parameters?.app_path) {
            return this.formatError("app_path required for install", "app-lifecycle");
          }
          await runCommand2("xcrun", ["simctl", "install", deviceId, params.parameters.app_path]);
          const data = {
            message: `App installed on device ${deviceId}`,
            sub_operation: "install",
            app_identifier: params.app_identifier,
            status: "installed"
          };
          return this.formatSuccess(data);
        }
        case "uninstall": {
          if (!params.app_identifier) {
            return this.formatError("app_identifier required for uninstall", "app-lifecycle");
          }
          await runCommand2("xcrun", ["simctl", "uninstall", deviceId, params.app_identifier]);
          const data = {
            message: `App ${params.app_identifier} uninstalled from device ${deviceId}`,
            sub_operation: "uninstall",
            app_identifier: params.app_identifier,
            status: "uninstalled"
          };
          return this.formatSuccess(data);
        }
        case "launch": {
          if (!params.app_identifier) {
            return this.formatError("app_identifier required for launch", "app-lifecycle");
          }
          const args = ["simctl", "launch", deviceId, params.app_identifier];
          if (params.parameters?.arguments) {
            args.push(...params.parameters.arguments);
          }
          const result = await runCommand2("xcrun", args);
          const pidMatch = result.stdout.match(/(\d+)/);
          const data = {
            message: `App ${params.app_identifier} launched on device ${deviceId}`,
            sub_operation: "launch",
            app_identifier: params.app_identifier,
            status: "running",
            pid: pidMatch ? pidMatch[1] : void 0
          };
          return this.formatSuccess(data);
        }
        case "terminate": {
          if (!params.app_identifier) {
            return this.formatError("app_identifier required for terminate", "app-lifecycle");
          }
          await runCommand2("xcrun", ["simctl", "terminate", deviceId, params.app_identifier]);
          const data = {
            message: `App ${params.app_identifier} terminated on device ${deviceId}`,
            sub_operation: "terminate",
            app_identifier: params.app_identifier,
            status: "terminated"
          };
          return this.formatSuccess(data);
        }
        default:
          return this.formatError(`Unknown sub_operation: ${subOp}`, "app-lifecycle");
      }
    } catch (error) {
      logger.error("App lifecycle operation failed", error);
      return this.formatError(error, "app-lifecycle");
    }
  }
  /**
   * Captures screenshots or records video from the simulator
   * Note: Video recording requires manual stop or process termination
   */
  async executeIO(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.sub_operation) {
        return this.formatError("sub_operation required for io", "io");
      }
      const deviceId = params.device_id || "booted";
      const subOp = params.sub_operation;
      const outputPath = params.parameters?.output_path;
      if (!outputPath) {
        return this.formatError("output_path required in parameters for io operation", "io");
      }
      switch (subOp) {
        case "screenshot": {
          await runCommand2("xcrun", ["simctl", "io", deviceId, "screenshot", outputPath]);
          const data = {
            message: `Screenshot saved to: ${outputPath}`,
            sub_operation: "screenshot",
            device_id: deviceId,
            note: `Screenshot captured from device ${deviceId}`
          };
          return this.formatSuccess(data);
        }
        case "video": {
          const data = {
            message: "Video recording requires background execution",
            sub_operation: "video",
            device_id: deviceId,
            note: `To record video, use: xcrun simctl io ${deviceId} recordVideo ${outputPath} (requires manual stop with Ctrl+C or process termination)`
          };
          return this.formatSuccess(data);
        }
        default:
          return this.formatError(`Unknown io sub_operation: ${subOp}`, "io");
      }
    } catch (error) {
      logger.error("IO operation failed", error);
      return this.formatError(error, "io");
    }
  }
  /**
   * Simulates push notifications to apps in the simulator
   * Accepts JSON payload as string or file path
   */
  async executePush(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const { writeFile, unlink } = await import("fs/promises");
      const { join } = await import("path");
      const { tmpdir } = await import("os");
      if (!params.app_identifier) {
        return this.formatError("app_identifier required for push", "push");
      }
      const payload = params.parameters?.payload;
      if (!payload) {
        return this.formatError("payload required in parameters for push", "push");
      }
      const deviceId = params.device_id || "booted";
      const bundleId = params.app_identifier;
      let payloadPath;
      let isTemporaryFile = false;
      if (payload.endsWith(".json") || payload.startsWith("/")) {
        payloadPath = payload;
      } else {
        payloadPath = join(tmpdir(), `push-notification-${Date.now()}.json`);
        await writeFile(payloadPath, payload, "utf8");
        isTemporaryFile = true;
      }
      try {
        await runCommand2("xcrun", ["simctl", "push", deviceId, bundleId, payloadPath]);
        const data = {
          message: `Push notification sent to ${bundleId}`,
          sub_operation: "push",
          app_identifier: bundleId,
          note: `Notification delivered to device ${deviceId}`
        };
        return this.formatSuccess(data);
      } finally {
        if (isTemporaryFile) {
          try {
            await unlink(payloadPath);
          } catch {
          }
        }
      }
    } catch (error) {
      logger.error("Push notification operation failed", error);
      return this.formatError(error, "push");
    }
  }
  /**
   * Opens a URL in the simulator (deep links, universal links, Safari)
   */
  async executeOpenURL(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.parameters?.url) {
        return this.formatError("url required in parameters for openurl", "openurl");
      }
      const deviceId = params.device_id || "booted";
      const url = params.parameters.url;
      await runCommand2("xcrun", ["simctl", "openurl", deviceId, url]);
      const data = {
        message: `Opened URL in simulator: ${url}`,
        sub_operation: "openurl",
        note: `URL opened on device ${deviceId}`
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("OpenURL operation failed", error);
      return this.formatError(error, "openurl");
    }
  }
  async executeList(_params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const { ResponseCache: ResponseCache2 } = await Promise.resolve().then(() => (init_response_cache(), response_cache_exports));
      const result = await runCommand2("xcrun", ["simctl", "list", "devices", "--json"]);
      const fullData = JSON.parse(result.stdout);
      const devices = [];
      for (const [runtime, deviceList] of Object.entries(fullData.devices || {})) {
        if (Array.isArray(deviceList)) {
          deviceList.forEach((device) => {
            devices.push({
              name: device.name,
              udid: device.udid,
              state: device.state,
              runtime: runtime.replace("com.apple.CoreSimulator.SimRuntime.", "")
            });
          });
        }
      }
      const cache = new ResponseCache2();
      const cacheId = cache.store({
        tool: "simulator-list",
        fullOutput: JSON.stringify(devices, null, 2),
        stderr: "",
        exitCode: 0,
        command: "xcrun simctl list devices --json",
        metadata: {
          deviceCount: devices.length,
          bootedCount: devices.filter((d) => d.state === "Booted").length
        }
      });
      const bootedCount = devices.filter((d) => d.state === "Booted").length;
      const data = {
        message: `Found ${devices.length} devices (${bootedCount} booted)`,
        note: `Use get-details with cache_id to see full device list`,
        devices: devices.slice(0, 5)
        // Show first 5 devices
      };
      return this.formatSuccess(data, `Device list cached. cache_id: ${cacheId}`);
    } catch (error) {
      logger.error("List operation failed", error);
      return this.formatError(error, "list");
    }
  }
  async executeHealthCheck() {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const issues = [];
      let xcodeVersion;
      try {
        const versionResult = await runCommand2("xcodebuild", ["-version"]);
        const versionMatch = versionResult.stdout.match(/Xcode\s+([\d.]+)/);
        xcodeVersion = versionMatch ? versionMatch[1] : void 0;
        await runCommand2("xcode-select", ["-p"]);
      } catch {
        issues.push("Xcode not found or not properly configured");
      }
      let simctlAvailable = false;
      try {
        await runCommand2("xcrun", ["simctl", "help"]);
        simctlAvailable = true;
      } catch {
        issues.push("simctl not available (Xcode Command Line Tools may not be installed)");
      }
      let bootedDevices = 0;
      try {
        const listResult = await runCommand2("xcrun", ["simctl", "list", "devices", "--json"]);
        const data2 = JSON.parse(listResult.stdout);
        for (const deviceList of Object.values(data2.devices || {})) {
          if (Array.isArray(deviceList)) {
            bootedDevices += deviceList.filter((d) => d.state === "Booted").length;
          }
        }
      } catch {
      }
      const data = {
        message: issues.length === 0 ? "iOS development environment is healthy" : `Found ${issues.length} issue(s)`,
        xcode_installed: !!xcodeVersion,
        xcode_version: xcodeVersion,
        simctl_available: simctlAvailable,
        issues: issues.length > 0 ? issues : void 0,
        note: bootedDevices > 0 ? `${bootedDevices} simulator(s) currently booted` : void 0
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Health check failed", error);
      return this.formatError(error, "health-check");
    }
  }
  /**
   * Gets the filesystem path to an app's container
   * Container types: 'data' (app data), 'bundle' (app bundle), 'group' (shared container)
   */
  async executeGetAppContainer(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.device_id || !params.app_identifier) {
        return this.formatError("device_id and app_identifier required for get-app-container", "get-app-container");
      }
      const deviceId = params.device_id;
      const bundleId = params.app_identifier;
      const containerType = params.parameters?.container_type || "data";
      const result = await runCommand2("xcrun", [
        "simctl",
        "get_app_container",
        deviceId,
        bundleId,
        containerType
      ]);
      const containerPath = result.stdout.trim();
      const data = {
        message: `App container path: ${containerPath}`,
        sub_operation: "get-container",
        app_identifier: bundleId,
        note: `Container type: ${containerType}`
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Get app container operation failed", error);
      return this.formatError(error, "get-app-container");
    }
  }
};

// dist/dispatchers/idb.js
var IDBDispatcher = class extends BaseDispatcher {
  getToolDefinition() {
    return {
      name: "execute_idb_command",
      description: "iOS UI automation via IDB with accessibility-first approach. Use ui-automation-workflows Skill for element finding and interaction patterns.",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: [
              "tap",
              "input",
              "gesture",
              "describe",
              "find-element",
              "app",
              "list-apps",
              "check-accessibility",
              "targets"
            ],
            description: "Operation: tap (tap coordinates), input (type text/keys), gesture (swipe/button), describe (get accessibility tree), find-element (search by label), app (manage apps), list-apps (show installed), check-accessibility (assess quality), targets (manage IDB connections)"
          },
          target: {
            type: "string",
            description: 'Target device UDID or "booted" for active simulator'
          },
          parameters: {
            type: "object",
            description: "Operation-specific parameters: x/y coordinates, text input, element query, app bundle ID, gesture type, etc."
          }
        },
        required: ["operation"]
      }
    };
  }
  async execute(args) {
    const { operation, target, parameters } = args;
    logger.info(`Executing IDB operation: ${operation}`);
    try {
      switch (operation) {
        case "tap":
          if (!parameters?.x || !parameters?.y) {
            return this.formatError("x and y coordinates required for tap", operation);
          }
          return await this.executeTap({
            target,
            parameters: { x: parameters.x, y: parameters.y, duration: parameters.duration }
          });
        case "input":
          if (!parameters) {
            return this.formatError("parameters required for input", operation);
          }
          return await this.executeInput({ target, parameters });
        case "gesture":
          if (!parameters?.gesture_type) {
            return this.formatError("gesture_type required in parameters", operation);
          }
          return await this.executeGesture({
            target,
            parameters: {
              gesture_type: parameters.gesture_type,
              direction: parameters.direction,
              button: parameters.button
            }
          });
        case "describe":
          return await this.executeDescribe({ target, parameters });
        case "find-element":
          if (!parameters?.query) {
            return this.formatError("query required in parameters for find-element", operation);
          }
          return await this.executeFindElement({ target, parameters: { query: parameters.query } });
        case "app":
          if (!parameters?.sub_operation) {
            return this.formatError("sub_operation required in parameters for app", operation);
          }
          return await this.executeApp({
            target,
            parameters: {
              sub_operation: parameters.sub_operation,
              bundle_id: parameters.bundle_id,
              app_path: parameters.app_path
            }
          });
        case "list-apps":
          return await this.executeListApps({
            target,
            parameters: { filter_type: parameters?.filter_type }
          });
        case "check-accessibility":
          return await this.executeCheckAccessibility({ target });
        case "targets":
          return await this.executeTargets({ parameters });
        default:
          return this.formatError(`Unknown operation: ${operation}`, operation);
      }
    } catch (error) {
      logger.error(`IDB operation failed: ${operation}`, error);
      return this.formatError(error, operation);
    }
  }
  async executeTap(params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.parameters?.x || !params.parameters?.y) {
        return this.formatError("x and y coordinates required", "tap");
      }
      const target = params.target || "booted";
      const x = params.parameters.x;
      const y = params.parameters.y;
      const duration = params.parameters.duration || 0.1;
      const command = `idb ui tap --udid "${target}" ${x} ${y} --duration ${duration}`;
      logger.debug(`Executing tap: ${command}`);
      await executeCommand2(command);
      const data = {
        message: `Tapped at coordinates (${x}, ${y})`,
        params: { x, y, duration }
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Tap operation failed", error);
      return this.formatError(error, "tap");
    }
  }
  /**
   * Input text and keyboard events to iOS apps
   * Supports: text input, single key presses, key sequences
   */
  async executeInput(params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.parameters) {
        return this.formatError("parameters required for input", "input");
      }
      const target = params.target || "booted";
      const { text, key, key_sequence } = params.parameters;
      if (text) {
        const command = `idb ui text --udid "${target}" "${text}"`;
        await executeCommand2(command);
        const data = {
          message: `Typed text: "${text}"`,
          note: "Text input completed"
        };
        return this.formatSuccess(data);
      }
      if (key) {
        const command = `idb ui key --udid "${target}" ${key}`;
        await executeCommand2(command);
        const data = {
          message: `Pressed key: ${key}`,
          note: "Key press completed"
        };
        return this.formatSuccess(data);
      }
      if (key_sequence && Array.isArray(key_sequence) && key_sequence.length > 0) {
        for (const keyName of key_sequence) {
          const command = `idb ui key --udid "${target}" ${keyName}`;
          await executeCommand2(command);
        }
        const data = {
          message: `Pressed ${key_sequence.length} key(s) in sequence`,
          note: `Keys: ${key_sequence.join(", ")}`
        };
        return this.formatSuccess(data);
      }
      return this.formatError("text, key, or key_sequence required in parameters", "input");
    } catch (error) {
      logger.error("Input operation failed", error);
      return this.formatError(error, "input");
    }
  }
  /**
   * Performs swipe gestures and hardware button presses
   * Swipe: Requires start/end coordinates and optional duration
   * Button: Supports HOME, LOCK, SIDE_BUTTON, SIRI
   */
  async executeGesture(params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.parameters?.gesture_type) {
        return this.formatError("gesture_type required in parameters", "gesture");
      }
      const target = params.target || "booted";
      const gestureType = params.parameters.gesture_type;
      if (gestureType === "swipe") {
        const { start_x, start_y, end_x, end_y, duration = 200 } = params.parameters;
        if (start_x === void 0 || start_y === void 0 || end_x === void 0 || end_y === void 0) {
          return this.formatError("start_x, start_y, end_x, end_y required for swipe gesture", "gesture");
        }
        const command = `idb ui swipe --udid "${target}" ${start_x} ${start_y} ${end_x} ${end_y} --duration ${duration}`;
        await executeCommand2(command);
        const data = {
          message: `Swiped from (${start_x},${start_y}) to (${end_x},${end_y})`,
          note: `Swipe duration: ${duration}ms`
        };
        return this.formatSuccess(data);
      } else if (gestureType === "button") {
        const { button } = params.parameters;
        if (!button) {
          return this.formatError("button required for button gesture", "gesture");
        }
        const command = `idb ui button --udid "${target}" ${button}`;
        await executeCommand2(command);
        const data = {
          message: `Pressed ${button} button`,
          note: "Hardware button press completed"
        };
        return this.formatSuccess(data);
      }
      return this.formatError(`Unknown gesture_type: ${gestureType}`, "gesture");
    } catch (error) {
      logger.error("Gesture operation failed", error);
      return this.formatError(error, "gesture");
    }
  }
  async executeDescribe(params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const target = params.target || "booted";
      const operation = params.parameters?.operation || "all";
      let command;
      if (operation === "point" && params.parameters?.x && params.parameters?.y) {
        const x = params.parameters.x;
        const y = params.parameters.y;
        command = `idb ui describe-point --udid "${target}" ${x} ${y}`;
      } else {
        command = `idb ui describe-all --udid "${target}"`;
      }
      const result = await executeCommand2(command);
      const elements = JSON.parse(result.stdout);
      const data = {
        message: `Retrieved accessibility tree with ${Array.isArray(elements) ? elements.length : "unknown"} elements`,
        note: "Accessibility-first: Use this data to find elements before taking screenshots",
        accessibility_priority: "HIGH - 3-4x faster than screenshots",
        params: { elements }
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Describe operation failed", error);
      return this.formatError(error, "describe");
    }
  }
  async executeFindElement(params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.parameters?.query) {
        return this.formatError("query required", "find-element");
      }
      const target = params.target || "booted";
      const query = params.parameters.query;
      const command = `idb ui describe-all --udid "${target}"`;
      const describeResult = await executeCommand2(command);
      const elements = JSON.parse(describeResult.stdout);
      const matches = Array.isArray(elements) ? elements.filter((el) => {
        const label = el.label?.toLowerCase() || "";
        const value = el.value?.toLowerCase() || "";
        const queryLower = query.toLowerCase();
        return label.includes(queryLower) || value.includes(queryLower);
      }) : [];
      const data = {
        message: `Found ${matches.length} element(s) matching "${query}"`,
        note: matches.length > 0 ? "Use centerX/centerY from results for tap coordinates" : "No matches found - try a different query or use full describe",
        params: { query, matches }
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Find element operation failed", error);
      return this.formatError(error, "find-element");
    }
  }
  /**
   * Manages app lifecycle via IDB
   * Supports: install, uninstall, launch, terminate
   */
  async executeApp(params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      if (!params.parameters?.sub_operation) {
        return this.formatError("sub_operation required in parameters", "app");
      }
      const target = params.target || "booted";
      const subOp = params.parameters.sub_operation;
      const bundleId = params.parameters.bundle_id;
      const appPath = params.parameters.app_path;
      switch (subOp) {
        case "install": {
          if (!appPath) {
            return this.formatError("app_path required for install", "app");
          }
          const command = `idb install "${appPath}" --udid "${target}"`;
          await executeCommand2(command);
          const data = {
            message: `App installed from: ${appPath}`,
            note: "App installation completed",
            params: { sub_operation: "install", app_path: appPath }
          };
          return this.formatSuccess(data);
        }
        case "uninstall": {
          if (!bundleId) {
            return this.formatError("bundle_id required for uninstall", "app");
          }
          const command = `idb uninstall "${bundleId}" --udid "${target}"`;
          await executeCommand2(command);
          const data = {
            message: `App uninstalled: ${bundleId}`,
            note: "App uninstallation completed",
            params: { sub_operation: "uninstall", bundle_id: bundleId }
          };
          return this.formatSuccess(data);
        }
        case "launch": {
          if (!bundleId) {
            return this.formatError("bundle_id required for launch", "app");
          }
          const command = `idb launch --udid "${target}" "${bundleId}"`;
          const result = await executeCommand2(command);
          let pid;
          const pidMatch = result.stdout.match(/pid:\s*(\d+)/i);
          if (pidMatch) {
            pid = pidMatch[1];
          }
          const data = {
            message: `App launched: ${bundleId}`,
            note: pid ? `Process ID: ${pid}` : "App launched successfully",
            params: { sub_operation: "launch", bundle_id: bundleId, pid }
          };
          return this.formatSuccess(data);
        }
        case "terminate": {
          if (!bundleId) {
            return this.formatError("bundle_id required for terminate", "app");
          }
          const command = `idb terminate "${bundleId}" --udid "${target}"`;
          await executeCommand2(command);
          const data = {
            message: `App terminated: ${bundleId}`,
            note: "App termination completed",
            params: { sub_operation: "terminate", bundle_id: bundleId }
          };
          return this.formatSuccess(data);
        }
        default:
          return this.formatError(`Unknown sub_operation: ${subOp}`, "app");
      }
    } catch (error) {
      logger.error("App operation failed", error);
      return this.formatError(error, "app");
    }
  }
  async executeListApps(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const target = params.target || "booted";
      const args = ["--udid", target, "list-apps"];
      if (params.parameters?.filter_type) {
        args.push(`--${params.parameters.filter_type}`);
      }
      const result = await runCommand2("idb", args);
      const apps = JSON.parse(result.stdout);
      const appCount = Array.isArray(apps) ? apps.length : 0;
      const filterNote = params.parameters?.filter_type ? ` (filtered: ${params.parameters.filter_type})` : "";
      const data = {
        message: `Found ${appCount} installed app(s)${filterNote}`,
        params: { apps, filter_type: params.parameters?.filter_type }
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("List apps operation failed", error);
      return this.formatError(error, "list-apps");
    }
  }
  async executeCheckAccessibility(_params) {
    try {
      const { executeCommand: executeCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const target = _params.target || "booted";
      const command = `idb ui describe-all --udid "${target}"`;
      const result = await executeCommand2(command);
      const elements = JSON.parse(result.stdout);
      let score = 0;
      let elementsWithLabels = 0;
      let interactiveElements = 0;
      if (Array.isArray(elements)) {
        elementsWithLabels = elements.filter((el) => el.label && el.label.trim()).length;
        interactiveElements = elements.filter((el) => el.type === "Button" || el.type === "TextField" || el.isEnabled).length;
        const totalElements = elements.length;
        if (totalElements > 0) {
          const labelPercentage = elementsWithLabels / totalElements * 100;
          const interactivePercentage = interactiveElements / totalElements * 50;
          score = Math.min(100, labelPercentage * 0.7 + interactivePercentage * 0.3);
        }
      }
      let recommendation;
      if (score >= 70) {
        recommendation = "HIGH - Use accessibility tree (3-4x faster, 80% cheaper)";
      } else if (score >= 40) {
        recommendation = "MEDIUM - Try accessibility first, fallback to screenshot if needed";
      } else {
        recommendation = "LOW - Consider screenshot for this screen (accessibility data minimal)";
      }
      const data = {
        message: `Accessibility quality: ${Math.round(score)}/100`,
        note: `${elementsWithLabels}/${Array.isArray(elements) ? elements.length : 0} elements have labels`,
        accessibility_priority: recommendation,
        guidance: score >= 70 ? "Proceed with accessibility-first workflow" : score >= 40 ? "Try find-element first, use screenshot as backup" : "Screenshot may be more reliable for this screen",
        params: {
          score: Math.round(score),
          total_elements: Array.isArray(elements) ? elements.length : 0,
          labeled_elements: elementsWithLabels,
          interactive_elements: interactiveElements
        }
      };
      return this.formatSuccess(data);
    } catch (error) {
      logger.error("Accessibility check failed", error);
      return this.formatError(error, "check-accessibility");
    }
  }
  /**
   * Manages IDB target connections
   * Supports: list, describe, connect, disconnect
   */
  async executeTargets(params) {
    try {
      const { runCommand: runCommand2 } = await Promise.resolve().then(() => (init_command(), command_exports));
      const subOp = params.parameters?.sub_operation || "list";
      switch (subOp) {
        case "list": {
          const result = await runCommand2("idb", ["list-targets", "--json"]);
          const targets = JSON.parse(result.stdout);
          const targetCount = Array.isArray(targets) ? targets.length : 0;
          const data = {
            message: `Found ${targetCount} IDB target(s)`,
            note: "Use describe to get details about a specific target",
            params: { sub_operation: "list", targets }
          };
          return this.formatSuccess(data);
        }
        case "describe": {
          const result = await runCommand2("idb", ["describe", "--json"]);
          const targetInfo = JSON.parse(result.stdout);
          const data = {
            message: "Target description retrieved",
            note: "Current IDB target details",
            params: { sub_operation: "describe", ...targetInfo }
          };
          return this.formatSuccess(data);
        }
        case "connect": {
          const data = {
            message: "Target connection managed automatically",
            note: "IDB automatically connects to the specified target (--udid) for each operation",
            params: { sub_operation: "connect" }
          };
          return this.formatSuccess(data);
        }
        case "disconnect": {
          const data = {
            message: "Target disconnection not required",
            note: "IDB automatically manages connections. Use list-targets to see available targets",
            params: { sub_operation: "disconnect" }
          };
          return this.formatSuccess(data);
        }
        default:
          return this.formatError(`Unknown sub_operation: ${subOp}`, "targets");
      }
    } catch (error) {
      logger.error("Targets operation failed", error);
      return this.formatError(error, "targets");
    }
  }
};

// dist/resources/catalog.js
var ResourceCatalog = class {
  resources = [
    {
      uri: "xc://operations/xcode",
      name: "Xcode Operations Reference",
      description: "Complete reference for all xcodebuild operations, parameters, and options",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://operations/simulator",
      name: "Simulator Operations Reference",
      description: "Complete reference for all simctl operations and device management",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://operations/idb",
      name: "IDB Operations Reference",
      description: "Complete reference for all IDB UI automation operations",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://reference/build-settings",
      name: "Xcode Build Settings",
      description: "Dictionary of common Xcode build settings and their meanings",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://reference/error-codes",
      name: "Error Codes Reference",
      description: "Common error codes from xcodebuild, simctl, and IDB with solutions",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://reference/device-specs",
      name: "iOS Device Specifications",
      description: "Simulator device types, runtimes, and specifications",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://reference/accessibility",
      name: "Accessibility Tree Documentation",
      description: "Guide to iOS accessibility tree structure and element types",
      mimeType: "text/markdown"
    },
    {
      uri: "xc://workflows/accessibility-first",
      name: "Accessibility-First Automation Pattern",
      description: "Best practice workflow: describe \u2192 find \u2192 tap (avoiding screenshots)",
      mimeType: "text/markdown"
    }
  ];
  /**
   * List all available resources (returns metadata only)
   */
  listResources() {
    logger.debug(`Listing ${this.resources.length} resources`);
    return this.resources;
  }
  /**
   * Read a specific resource by URI (loads full content)
   */
  async readResource(uri) {
    logger.info(`Reading resource: ${uri}`);
    const resource = this.resources.find((r) => r.uri === uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }
    const content = this.getResourceContent(uri);
    if (!content) {
      throw new Error(`Failed to load content for: ${uri}`);
    }
    return content;
  }
  /**
   * Get resource content by URI
   * In production, these would load from markdown files
   */
  getResourceContent(uri) {
    switch (uri) {
      case "xc://operations/xcode":
        return this.getXcodeOperationsReference();
      case "xc://operations/simulator":
        return this.getSimulatorOperationsReference();
      case "xc://operations/idb":
        return this.getIDBOperationsReference();
      case "xc://reference/build-settings":
        return this.getBuildSettingsReference();
      case "xc://reference/error-codes":
        return this.getErrorCodesReference();
      case "xc://reference/device-specs":
        return this.getDeviceSpecsReference();
      case "xc://reference/accessibility":
        return this.getAccessibilityReference();
      case "xc://workflows/accessibility-first":
        return this.getAccessibilityFirstWorkflow();
      default:
        return `# Resource Not Implemented

URI: ${uri}

This resource content will be added in a future update.`;
    }
  }
  // Resource content methods (placeholders for now)
  getXcodeOperationsReference() {
    return `# Xcode Operations Reference

## execute_xcode_command

### Operations

#### build
Compile the project for specified scheme and configuration.

**Parameters:**
- \`scheme\` (required): Scheme name
- \`configuration\`: Debug or Release (default: Debug)
- \`destination\`: Build destination (e.g., "platform=iOS Simulator,name=iPhone 15")
- \`options.clean_before_build\`: Clean before building
- \`options.parallel\`: Enable parallel builds
- \`options.sdk\`: Target SDK
- \`options.arch\`: Target architecture

**Example:**
\`\`\`json
{
  "operation": "build",
  "scheme": "MyApp",
  "configuration": "Debug",
  "destination": "platform=iOS Simulator,name=iPhone 15"
}
\`\`\`

#### clean
Remove all build artifacts for the project.

**Parameters:**
- \`project_path\` (optional): Auto-detected if omitted
- \`scheme\` (optional): Specific scheme to clean

#### test
Run tests for the specified scheme.

**Parameters:**
- \`scheme\` (required): Scheme name
- \`destination\`: Test destination
- \`options.test_plan\`: Specific test plan to run
- \`options.only_testing\`: Array of test identifiers to run
- \`options.skip_testing\`: Array of test identifiers to skip

#### list
List schemes and targets in the project.

**Parameters:**
- \`project_path\` (optional): Auto-detected if omitted

**Returns:** Array of schemes and targets

#### version
Get Xcode and SDK version information.

**Parameters:** None

**Returns:** Xcode version, build number, and available SDKs

## Tips

- Use **xcode-workflows** Skill for guidance on operation selection
- Operations support auto-detection of project path
- Build logs use progressive disclosure for large outputs
`;
  }
  getSimulatorOperationsReference() {
    return `# Simulator Operations Reference

## execute_simulator_command

### Operations

#### device-lifecycle
Manage simulator device lifecycle.

**Sub-operations:**
- \`boot\`: Start a simulator
- \`shutdown\`: Stop a running simulator
- \`create\`: Create a new simulator
- \`delete\`: Delete a simulator
- \`erase\`: Erase a simulator's data
- \`clone\`: Clone an existing simulator

#### app-lifecycle
Manage app installation and lifecycle.

**Sub-operations:**
- \`install\`: Install an app (.app bundle)
- \`uninstall\`: Remove an installed app
- \`launch\`: Launch an app
- \`terminate\`: Stop a running app

#### io
Capture screenshots and videos.

**Sub-operations:**
- \`screenshot\`: Capture a screenshot
- \`video\`: Record a video

#### list
List all available simulators with progressive disclosure.

**Returns:** Summary with cache ID for full device list

#### health-check
Validate iOS development environment.

**Checks:**
- Xcode installation
- Command line tools
- simctl availability
- CoreSimulator framework

## Tips

- Use **simulator-workflows** Skill for device selection guidance
- \`device_id\` can be UDID or device name (e.g., "iPhone 15")
- Large device lists use progressive disclosure
`;
  }
  getIDBOperationsReference() {
    return `# IDB Operations Reference

## execute_idb_command

### Accessibility-First Strategy

**Always start with:**
1. \`describe\` operation (fast, 50 tokens) - Get accessibility tree
2. \`find-element\` operation - Search by label/identifier
3. \`tap\` operation - Tap discovered coordinates

**Fallback to screenshots only if accessibility data insufficient.**

### Operations

#### describe
Query UI accessibility tree (PREFERRED METHOD).

**Parameters:**
- \`target\`: Device UDID or "booted"
- \`parameters.operation\`: "all" (full tree) or "point" (at coordinates)

**Returns:** Accessibility tree with element coordinates

**Token cost:** ~50 tokens vs ~170 for screenshot

#### find-element
Semantic search for UI elements.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.query\`: Element label or identifier to search

**Returns:** Matching elements with tap coordinates

#### tap
Tap at coordinates.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.x\`: X coordinate
- \`parameters.y\`: Y coordinate
- \`parameters.duration\`: Optional tap duration

#### input
Input text or keyboard operations.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.text\`: Text to input
- \`parameters.key\`: Key to press (home, return, etc.)

#### gesture
Perform gestures and button presses.

**Parameters:**
- \`target\`: Device UDID
- \`parameters.gesture_type\`: swipe, button
- \`parameters.direction\`: up, down, left, right (for swipe)
- \`parameters.button\`: HOME, LOCK, SIRI, etc.

#### check-accessibility
Assess accessibility data quality.

**Returns:** Quality score and recommendation (use accessibility vs screenshot)

## Tips

- Use **ui-automation-workflows** Skill for element finding patterns
- **Accessibility-first is 3-4x faster than screenshots**
- Use \`check-accessibility\` to decide strategy
`;
  }
  getBuildSettingsReference() {
    return `# Xcode Build Settings Reference

## Common Build Settings

### Product Settings
- \`PRODUCT_NAME\`: Name of the built product
- \`PRODUCT_BUNDLE_IDENTIFIER\`: App bundle identifier
- \`INFOPLIST_FILE\`: Path to Info.plist

### SDK & Deployment
- \`SDKROOT\`: SDK to build against (iphoneos, iphonesimulator)
- \`IPHONEOS_DEPLOYMENT_TARGET\`: Minimum iOS version

### Code Signing
- \`CODE_SIGN_IDENTITY\`: Code signing identity
- \`DEVELOPMENT_TEAM\`: Development team ID
- \`PROVISIONING_PROFILE_SPECIFIER\`: Provisioning profile name

### Build Locations
- \`BUILD_DIR\`: Build directory
- \`CONFIGURATION_BUILD_DIR\`: Configuration-specific build dir
- \`DERIVED_DATA_PATH\`: DerivedData location

## Querying Build Settings

Use \`execute_xcode_command\` with operation "list" to see all settings.

## Tips

- Use **xcode-workflows** Skill for build configuration guidance
- Build settings can be queried per scheme/configuration
`;
  }
  getErrorCodesReference() {
    return `# Error Codes Reference

## Common xcodebuild Errors

### Build Errors
- **Exit code 65**: Build failed (compilation errors)
- **Exit code 66**: Build failed (packaging errors)
- **Exit code 70**: Internal xcodebuild error

### Test Errors
- **Exit code 1**: Tests failed
- **Exit code 65**: Test compilation failed

## Common simctl Errors

### Device Errors
- **Device not found**: Invalid UDID or name
- **Device already booted**: Trying to boot an already running device
- **Unable to boot**: CoreSimulator issues

### App Errors
- **App not installed**: Bundle ID not found
- **Launch failed**: App crashed on launch

## Common IDB Errors

### Connection Errors
- **No target found**: IDB not connected or device unavailable
- **Connection refused**: IDB daemon not running

### UI Errors
- **Element not found**: Accessibility tree doesn't contain element
- **Tap failed**: Coordinates out of bounds or element not tappable

## Tips

- Use **crash-debugging** Skill for crash analysis
- Use **simulator-workflows** Skill for device troubleshooting
- Check logs with \`simctl-device diagnose\` for detailed errors
`;
  }
  getDeviceSpecsReference() {
    return `# iOS Device Specifications

## Simulator Device Types

### iPhone
- iPhone SE (3rd generation)
- iPhone 14, 14 Plus, 14 Pro, 14 Pro Max
- iPhone 15, 15 Plus, 15 Pro, 15 Pro Max

### iPad
- iPad (10th generation)
- iPad Air (5th generation)
- iPad Pro (11-inch, 4th generation)
- iPad Pro (12.9-inch, 6th generation)

## iOS Runtimes

Available runtimes depend on Xcode version:
- iOS 15.0+
- iOS 16.0+
- iOS 17.0+
- iOS 18.0+

## Querying Available Devices

Use \`execute_simulator_command\` with operation "list" to see all available devices and runtimes.

## Tips

- Use **simulator-workflows** Skill for device selection guidance
- Device names can be used instead of UDIDs for convenience
- Check runtime availability before creating devices
`;
  }
  getAccessibilityReference() {
    return `# Accessibility Tree Documentation

## Accessibility Tree Structure

The accessibility tree is a hierarchical representation of UI elements exposed to assistive technologies like VoiceOver.

### Element Properties

Each element includes:
- **label**: Text description of the element
- **value**: Current value (for inputs, sliders, etc.)
- **type**: Element type (button, text field, etc.)
- **frame**: Bounding box (x, y, width, height)
- **enabled**: Whether element is interactive
- **visible**: Whether element is on screen

### Element Types

- **Button**: Tappable buttons
- **TextField**: Text input fields
- **StaticText**: Non-interactive text labels
- **Cell**: Table/collection view cells
- **Image**: Image views
- **ScrollView**: Scrollable containers
- **NavigationBar**: Navigation bars
- **TabBar**: Tab bars

## Querying the Tree

Use \`execute_idb_command\` with operation "describe":

\`\`\`json
{
  "operation": "describe",
  "target": "booted",
  "parameters": {
    "operation": "all"
  }
}
\`\`\`

## Tips

- **Accessibility-first is 3-4x faster than screenshots**
- Use **ui-automation-workflows** Skill for element finding patterns
- Check accessibility quality with \`check-accessibility\` operation
`;
  }
  getAccessibilityFirstWorkflow() {
    return `# Accessibility-First Automation Pattern

## The Strategy

**Always prefer accessibility tree over screenshots for UI automation.**

### Why Accessibility-First?

- **3-4x faster**: ~120ms vs ~2000ms for screenshots
- **80% cheaper**: ~50 tokens vs ~170 tokens
- **More reliable**: Survives theme changes, animations
- **Works offline**: No visual processing needed

## Workflow

### 1. Query Accessibility Tree

\`\`\`json
{
  "operation": "describe",
  "target": "booted"
}
\`\`\`

**Returns:** Element tree with labels and coordinates

### 2. Find Element

\`\`\`json
{
  "operation": "find-element",
  "target": "booted",
  "parameters": {
    "query": "Login"
  }
}
\`\`\`

**Returns:** Matching elements with tap coordinates

### 3. Interact

\`\`\`json
{
  "operation": "tap",
  "target": "booted",
  "parameters": {
    "x": 187,
    "y": 450
  }
}
\`\`\`

### 4. Only Fallback to Screenshots if Needed

Check accessibility quality first:

\`\`\`json
{
  "operation": "check-accessibility",
  "target": "booted"
}
\`\`\`

If quality is "insufficient", then use screenshots.

## Tips

- Use **ui-automation-workflows** Skill for detailed guidance
- **Always try describe first**, screenshot last
- Accessibility data survives app theme changes
- Most apps have good accessibility support
`;
  }
};

// dist/index.js
var server = new Server({
  name: "xclaude-plugin-mcp",
  version: "0.0.1"
}, {
  capabilities: {
    tools: {},
    resources: {}
  }
});
var xcodeDispatcher = new XcodeDispatcher();
var simulatorDispatcher = new SimulatorDispatcher();
var idbDispatcher = new IDBDispatcher();
var resourceCatalog = new ResourceCatalog();
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug("Listing tools");
  return {
    tools: [
      xcodeDispatcher.getToolDefinition(),
      simulatorDispatcher.getToolDefinition(),
      idbDispatcher.getToolDefinition()
    ]
  };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: toolArgs } = request.params;
  logger.info(`Tool called: ${name}`);
  try {
    let result;
    switch (name) {
      case "execute_xcode_command":
        result = await xcodeDispatcher.execute(toolArgs);
        break;
      case "execute_simulator_command":
        result = await simulatorDispatcher.execute(toolArgs);
        break;
      case "execute_idb_command":
        result = await idbDispatcher.execute(toolArgs);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.error(`Tool execution failed: ${name}`, error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            tool: name,
            arguments: toolArgs
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  logger.debug("Listing resources");
  return {
    resources: resourceCatalog.listResources()
  };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  logger.info(`Resource requested: ${uri}`);
  try {
    const content = await resourceCatalog.readResource(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content
        }
      ]
    };
  } catch (error) {
    logger.error(`Resource read failed: ${uri}`, error);
    throw error;
  }
});
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("xclaude-plugin MCP server started successfully");
    logger.info("Token overhead: ~2.2k at rest");
    logger.info("Tools: 3 dispatchers registered");
    logger.info("Resources: Available on-demand");
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}
main();
