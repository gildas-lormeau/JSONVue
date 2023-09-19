/* global window, document, chrome, top, BigInt */

const CLASS_COLLAPSED = "collapsed";
const CLASS_HOVERED = "hovered";
const CLASS_SELECTED = "selected";
const TAG_LIST_ITEM = "LI";
const TITLE_OPEN_COLLAPSIBLES = "expand all";
const LABEL_OPEN_COLLAPSIBLES = "+";
const TITLE_CLOSE_COLLAPSIBLES = "collapse all";
const LABEL_CLOSE_COLLAPSIBLES = "-";
const TITLE_VIEW_SOURCE = "view unformatted source";
const LABEL_VIEW_SOURCE = "view source";
const MENU_ID_COPY_PATH = "copy-path";
const MENU_ID_COPY_VALUE = "copy-value";
const MENU_ID_COPY_JSON_VALUE = "copy-json-value";
// cf. https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js
// eslint-disable-next-line no-misleading-character-class
const REGEXP_IDENTIFIER = /^(?:[$A-Z_a-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D])(?:[$0-9A-Z_a-z\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF])*$/;

// regexpxs extracted from
// (c) BSD-3-Clause
// https://github.com/fastify/secure-json-parse/graphs/contributors and https://github.com/hapijs/bourne/graphs/contributors

const suspectProtoRx = /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/;
const suspectConstructorRx = /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/;

/*
	json_parse.js
	2012-06-20

	Public Domain.

	NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	This file creates a json_parse function.
	During create you can (optionally) specify some behavioural switches

		require('json-bigint')(options)

			The optional options parameter holds switches that drive certain
			aspects of the parsing process:
			* options.strict = true will warn about duplicate-key usage in the json.
			  The default (strict = false) will silently ignore those and overwrite
			  values for keys that are in duplicate use.

	The resulting function follows this signature:
		json_parse(text, reviver)
			This method parses a JSON text to produce an object or array.
			It can throw a SyntaxError exception.

			The optional reviver parameter is a function that can filter and
			transform the results. It receives each of the keys and values,
			and its return value is used instead of the original value.
			If it returns what it received, then the structure is not modified.
			If it returns undefined then the member is deleted.

			Example:

			// Parse the text. Values that look like ISO date strings will
			// be converted to Date objects.

			myData = json_parse(text, function (key, value) {
				var a;
				if (typeof value === 'string') {
					a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
					if (a) {
						return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
							+a[5], +a[6]));
					}
				}
				return value;
			});

	This is a reference implementation. You are free to copy, modify, or
	redistribute.

	This code should be minified before deployment.
	See http://javascript.crockford.com/jsmin.html

	USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	NOT CONTROL.
*/

/*members "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
	hasOwnProperty, message, n, name, prototype, push, r, t, text
*/

var json_parse = function (options) {
	"use strict";

	// This is a function that can parse a JSON text, producing a JavaScript
	// data structure. It is a simple, recursive descent parser. It does not use
	// eval or regular expressions, so it can be used as a model for implementing
	// a JSON parser in other languages.

	// We are defining the function inside of another function to avoid creating
	// global variables.

	// Default options one can override by passing options to the parse()
	var _options = {
		strict: false, // not being strict means do not generate syntax errors for "duplicate key"
		storeAsString: false, // toggles whether the values should be stored as BigNumber (default) or a string
		alwaysParseAsBig: false, // toggles whether all numbers should be Big
		useNativeBigInt: false, // toggles whether to use native BigInt instead of bignumber.js
		protoAction: "error",
		constructorAction: "error",
	};

	// If there are options, then use them to override the default _options
	if (options !== undefined && options !== null) {
		if (options.strict === true) {
			_options.strict = true;
		}
		if (options.storeAsString === true) {
			_options.storeAsString = true;
		}
		_options.alwaysParseAsBig =
			options.alwaysParseAsBig === true ? options.alwaysParseAsBig : false;
		_options.useNativeBigInt =
			options.useNativeBigInt === true ? options.useNativeBigInt : false;

		if (typeof options.constructorAction !== "undefined") {
			if (
				options.constructorAction === "error" ||
				options.constructorAction === "ignore" ||
				options.constructorAction === "preserve"
			) {
				_options.constructorAction = options.constructorAction;
			} else {
				throw new Error(
					`Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed ${options.constructorAction}`
				);
			}
		}

		if (typeof options.protoAction !== "undefined") {
			if (
				options.protoAction === "error" ||
				options.protoAction === "ignore" ||
				options.protoAction === "preserve"
			) {
				_options.protoAction = options.protoAction;
			} else {
				throw new Error(
					`Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed ${options.protoAction}`
				);
			}
		}
	}

	var at, // The index of the current character
		ch, // The current character
		escapee = {
			"\"": "\"",
			"\\": "\\",
			"/": "/",
			b: "\b",
			f: "\f",
			n: "\n",
			r: "\r",
			t: "\t",
		},
		text,
		error = function (m) {
			// Call error when something is wrong.

			throw {
				name: "SyntaxError",
				message: m,
				at: at,
				text: text,
			};
		},
		next = function (c) {
			// If a c parameter is provided, verify that it matches the current character.

			if (c && c !== ch) {
				error("Expected '" + c + "' instead of '" + ch + "'");
			}

			// Get the next character. When there are no more characters,
			// return the empty string.

			ch = text.charAt(at);
			at += 1;
			return ch;
		},
		number = function () {
			// Parse a number value.

			var number,
				string = "";

			if (ch === "-") {
				string = "-";
				next("-");
			}
			while (ch >= "0" && ch <= "9") {
				string += ch;
				next();
			}
			if (ch === ".") {
				string += ".";
				while (next() && ch >= "0" && ch <= "9") {
					string += ch;
				}
			}
			if (ch === "e" || ch === "E") {
				string += ch;
				next();
				if (ch === "-" || ch === "+") {
					string += ch;
					next();
				}
				while (ch >= "0" && ch <= "9") {
					string += ch;
					next();
				}
			}
			number = +string;
			if (!isFinite(number)) {
				error("Bad number");
			} else {
				// if (BigNumber == null) BigNumber = require("bignumber.js");
				if (Number.isSafeInteger(number))
					return !_options.alwaysParseAsBig
						? number
						: BigInt(number);
				else
					// Number with fractional part should be treated as number(double) including big integers in scientific notation, i.e 1.79e+308
					return _options.storeAsString
						? string
						: /[.eE]/.test(string)
							? number
							: BigInt(string);
			}
		},
		string = function () {
			// Parse a string value.

			var hex,
				i,
				string = "",
				uffff;

			// When parsing for string values, we must look for " and \ characters.

			if (ch === "\"") {
				var startAt = at;
				while (next()) {
					if (ch === "\"") {
						if (at - 1 > startAt) string += text.substring(startAt, at - 1);
						next();
						return string;
					}
					if (ch === "\\") {
						if (at - 1 > startAt) string += text.substring(startAt, at - 1);
						next();
						if (ch === "u") {
							uffff = 0;
							for (i = 0; i < 4; i += 1) {
								hex = parseInt(next(), 16);
								if (!isFinite(hex)) {
									break;
								}
								uffff = uffff * 16 + hex;
							}
							string += String.fromCharCode(uffff);
						} else if (typeof escapee[ch] === "string") {
							string += escapee[ch];
						} else {
							break;
						}
						startAt = at;
					}
				}
			}
			error("Bad string");
		},
		white = function () {
			// Skip whitespace.

			while (ch && ch <= " ") {
				next();
			}
		},
		word = function () {
			// true, false, or null.

			switch (ch) {
				case "t":
					next("t");
					next("r");
					next("u");
					next("e");
					return true;
				case "f":
					next("f");
					next("a");
					next("l");
					next("s");
					next("e");
					return false;
				case "n":
					next("n");
					next("u");
					next("l");
					next("l");
					return null;
			}
			error("Unexpected '" + ch + "'");
		},
		value, // Place holder for the value function.
		array = function () {
			// Parse an array value.

			var array = [];

			if (ch === "[") {
				next("[");
				white();
				if (ch === "]") {
					next("]");
					return array; // empty array
				}
				while (ch) {
					array.push(value());
					white();
					if (ch === "]") {
						next("]");
						return array;
					}
					next(",");
					white();
				}
			}
			error("Bad array");
		},
		object = function () {
			// Parse an object value.

			var key,
				object = Object.create(null);

			if (ch === "{") {
				next("{");
				white();
				if (ch === "}") {
					next("}");
					return object; // empty object
				}
				while (ch) {
					key = string();
					white();
					next(":");
					if (
						_options.strict === true &&
						Object.hasOwnProperty.call(object, key)
					) {
						error("Duplicate key \"" + key + "\"");
					}

					if (suspectProtoRx.test(key) === true) {
						if (_options.protoAction === "error") {
							error("Object contains forbidden prototype property");
						} else if (_options.protoAction === "ignore") {
							value();
						} else {
							object[key] = value();
						}
					} else if (suspectConstructorRx.test(key) === true) {
						if (_options.constructorAction === "error") {
							error("Object contains forbidden constructor property");
						} else if (_options.constructorAction === "ignore") {
							value();
						} else {
							object[key] = value();
						}
					} else {
						object[key] = value();
					}

					white();
					if (ch === "}") {
						next("}");
						return object;
					}
					next(",");
					white();
				}
			}
			error("Bad object");
		};

	value = function () {
		// Parse a JSON value. It could be an object, an array, a string, a number,
		// or a word.

		white();
		switch (ch) {
			case "{":
				return object();
			case "[":
				return array();
			case "\"":
				return string();
			case "-":
				return number();
			default:
				return ch >= "0" && ch <= "9" ? number() : word();
		}
	};

	// Return the json_parse function. It will have access to all of the above
	// functions and variables.

	return function (source, reviver) {
		var result;

		text = source + "";
		at = 0;
		ch = " ";
		result = value();
		white();
		if (ch) {
			error("Syntax error");
		}

		// If there is a reviver function, we recursively walk the new structure,
		// passing each name/value pair to the reviver function for possible
		// transformation, starting with a temporary root object that holds the result
		// in an empty key. If there is not a reviver function, we simply return the
		// result.

		return typeof reviver === "function"
			? (function walk(holder, key) {
				var v,
					value = holder[key];
				if (value && typeof value === "object") {
					Object.keys(value).forEach(function (k) {
						v = walk(value, k);
						if (v !== undefined) {
							value[k] = v;
						} else {
							delete value[k];
						}
					});
				}
				return reviver.call(holder, key, value);
			})({ "": result }, "")
			: result;
	};
};

/*
	json2.js
	2013-05-26

	Public Domain.

	NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	See http://www.JSON.org/js.html


	This code should be minified before deployment.
	See http://javascript.crockford.com/jsmin.html

	USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	NOT CONTROL.


	This file creates a global JSON object containing two methods: stringify
	and parse.

		JSON.stringify(value, replacer, space)
			value       any JavaScript value, usually an object or array.

			replacer    an optional parameter that determines how object
						values are stringified for objects. It can be a
						function or an array of strings.

			space       an optional parameter that specifies the indentation
						of nested structures. If it is omitted, the text will
						be packed without extra whitespace. If it is a number,
						it will specify the number of spaces to indent at each
						level. If it is a string (such as '\t' or '&nbsp;'),
						it contains the characters used to indent at each level.

			This method produces a JSON text from a JavaScript value.

			When an object value is found, if the object contains a toJSON
			method, its toJSON method will be called and the result will be
			stringified. A toJSON method does not serialize: it returns the
			value represented by the name/value pair that should be serialized,
			or undefined if nothing should be serialized. The toJSON method
			will be passed the key associated with the value, and this will be
			bound to the value

			For example, this would serialize Dates as ISO strings.

				Date.prototype.toJSON = function (key) {
					function f(n) {
						// Format integers to have at least two digits.
						return n < 10 ? '0' + n : n;
					}

					return this.getUTCFullYear()   + '-' +
						 f(this.getUTCMonth() + 1) + '-' +
						 f(this.getUTCDate())      + 'T' +
						 f(this.getUTCHours())     + ':' +
						 f(this.getUTCMinutes())   + ':' +
						 f(this.getUTCSeconds())   + 'Z';
				};

			You can provide an optional replacer method. It will be passed the
			key and value of each member, with this bound to the containing
			object. The value that is returned from your method will be
			serialized. If your method returns undefined, then the member will
			be excluded from the serialization.

			If the replacer parameter is an array of strings, then it will be
			used to select the members to be serialized. It filters the results
			such that only members with keys listed in the replacer array are
			stringified.

			Values that do not have JSON representations, such as undefined or
			functions, will not be serialized. Such values in objects will be
			dropped; in arrays they will be replaced with null. You can use
			a replacer function to replace those with JSON values.
			JSON.stringify(undefined) returns undefined.

			The optional space parameter produces a stringification of the
			value that is filled with line breaks and indentation to make it
			easier to read.

			If the space parameter is a non-empty string, then that string will
			be used for indentation. If the space parameter is a number, then
			the indentation will be that many spaces.

			Example:

			text = JSON.stringify(['e', {pluribus: 'unum'}]);
			// text is '["e",{"pluribus":"unum"}]'


			text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
			// text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

			text = JSON.stringify([new Date()], function (key, value) {
				return this[key] instanceof Date ?
					'Date(' + this[key] + ')' : value;
			});
			// text is '["Date(---current time---)"]'


		JSON.parse(text, reviver)
			This method parses a JSON text to produce an object or array.
			It can throw a SyntaxError exception.

			The optional reviver parameter is a function that can filter and
			transform the results. It receives each of the keys and values,
			and its return value is used instead of the original value.
			If it returns what it received, then the structure is not modified.
			If it returns undefined then the member is deleted.

			Example:

			// Parse the text. Values that look like ISO date strings will
			// be converted to Date objects.

			myData = JSON.parse(text, function (key, value) {
				var a;
				if (typeof value === 'string') {
					a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
					if (a) {
						return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
							+a[5], +a[6]));
					}
				}
				return value;
			});

			myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
				var d;
				if (typeof value === 'string' &&
						value.slice(0, 5) === 'Date(' &&
						value.slice(-1) === ')') {
					d = new Date(value.slice(5, -1));
					if (d) {
						return d;
					}
				}
				return value;
			});


	This is a reference implementation. You are free to copy, modify, or
	redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
	call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
	getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
	lastIndex, length, parse, prototype, push, replace, slice, stringify,
	test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

const jsonStringify = (function () {
	"use strict";

	// eslint-disable-next-line
	var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		gap,
		indent,
		meta = {    // table of character substitutions
			"\b": "\\b",
			"\t": "\\t",
			"\n": "\\n",
			"\f": "\\f",
			"\r": "\\r",
			"\"": "\\\"",
			"\\": "\\\\"
		},
		rep;


	function quote(string) {

		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.

		escapable.lastIndex = 0;
		return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === "string"
				? c
				: "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
		}) + "\"" : "\"" + string + "\"";
	}


	function str(key, holder) {

		// Produce a string from holder[key].

		var i,          // The loop counter.
			k,          // The member key.
			v,          // The member value.
			length,
			mind = gap,
			partial,
			value = holder[key],
			isBigInt = value != null && (typeof value == "bigint");

		// If the value has a toJSON method, call it to obtain a replacement value.

		if (value && typeof value === "object" &&
			typeof value.toJSON === "function") {
			value = value.toJSON(key);
		}

		// If we were called with a replacer function, then call the replacer to
		// obtain a replacement value.

		if (typeof rep === "function") {
			value = rep.call(holder, key, value);
		}

		// What happens next depends on the value's type.

		switch (typeof value) {
			case "string":
				if (isBigInt) {
					return value;
				} else {
					return quote(value);
				}

			case "number":

				// JSON numbers must be finite. Encode non-finite numbers as null.

				return isFinite(value) ? String(value) : "null";

			case "boolean":
			case "null":
			case "bigint":

				// If the value is a boolean or null, convert it to a string. Note:
				// typeof null does not produce 'null'. The case is included here in
				// the remote chance that this gets fixed someday.

				// If the type is 'object', we might be dealing with an object or an array or
				// null.

				return String(value);

			case "object":

				// Due to a specification blunder in ECMAScript, typeof null is 'object',
				// so watch out for that case.

				if (!value) {
					return "null";
				}

				// Make an array to hold the partial results of stringifying this object value.

				gap += indent;
				partial = [];

				// Is the value an array?

				if (Object.prototype.toString.apply(value) === "[object Array]") {

					// The value is an array. Stringify every element. Use null as a placeholder
					// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || "null";
					}

					// Join all of the elements together, separated with commas, and wrap them in
					// brackets.

					v = partial.length === 0
						? "[]"
						: gap
							? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
							: "[" + partial.join(",") + "]";
					gap = mind;
					return v;
				}

				// If the replacer is an array, use it to select the members to be stringified.

				if (rep && typeof rep === "object") {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === "string") {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ": " : ":") + v);
							}
						}
					}
				} else {

					// Otherwise, iterate through all of the keys in the object.

					Object.keys(value).forEach(function (k) {
						var v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ": " : ":") + v);
						}
					});
				}

				// Join all of the member texts together, separated with commas,
				// and wrap them in braces.

				v = partial.length === 0
					? "{}"
					: gap
						? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
						: "{" + partial.join(",") + "}";
				gap = mind;
				return v;
		}
	}

	// If the JSON object does not yet have a stringify method, give it one.

	return function (value, replacer, space) {

		// The stringify method takes a value and an optional replacer, and an optional
		// space parameter, and returns a JSON text. The replacer can be a function
		// that can replace values, or an array of strings that will select the keys.
		// A default replacer method can be provided. Use of the space parameter can
		// produce text that is more easily readable.

		var i;
		gap = "";
		indent = "";

		// If the space parameter is a number, make an indent string containing that
		// many spaces.

		if (typeof space === "number") {
			for (i = 0; i < space; i += 1) {
				indent += " ";
			}

			// If the space parameter is a string, it will be used as the indent string.

		} else if (typeof space === "string") {
			indent = space;
		}

		// If there is a replacer, it must be a function or an array.
		// Otherwise, throw an error.

		rep = replacer;
		if (replacer && typeof replacer !== "function" &&
			(typeof replacer !== "object" ||
				typeof replacer.length !== "number")) {
			throw new Error("JSON.stringify");
		}

		// Make a fake root object containing our value under the key of ''.
		// Return the result of stringifying the value.

		return str("", { "": value });
	};

}());

const parseJson = json_parse();

let collapserElements, statusElement, jsonObject, copiedSelector, jsonSelector, jsonPath, selectedListItem, hoveredListItem, originalBody, supportBigInt;
chrome.runtime.onMessage.addListener(message => {
	if (message.copy) {
		if (message.type == MENU_ID_COPY_PATH && jsonPath) {
			copyText(jsonPath);
		} else if (message.type == MENU_ID_COPY_VALUE || message.type == MENU_ID_COPY_JSON_VALUE) {
			let value = jsonObject;
			copiedSelector.forEach(propertyName => value = value[propertyName]);
			if (value) {
				if (supportBigInt) {
					value = jsonStringify(value);
				} else {
					value = JSON.stringify(value);
				}
				if (message.type == MENU_ID_COPY_VALUE) {
					copyText(value);
				} else if (message.type == MENU_ID_COPY_JSON_VALUE) {
					copyText(JSON.stringify(value));
				}
			}
		}
	}
});
init();

async function init() {
	let preElement = document.body.childNodes[0];
	if (preElement && preElement.tagName != "PRE") {
		preElement = document.body.childNodes[1];
	}
	if (document.body && (preElement && preElement.tagName == "PRE" || document.body.children.length == 0)) {
		const textElement = document.body.children.length ? preElement : document.body;
		const options = await sendMessage({ getOptions: true });
		supportBigInt = options.supportBigInt;
		const jsonInfo = extractJsonInfo(textElement.innerText, options);
		if (jsonInfo) {
			originalBody = document.body.cloneNode(true);
			await processData(jsonInfo, options);
		}
	}
}

function extractJsonInfo(rawText, options) {
	const initialRawText = rawText;
	rawText = rawText.trim().replace(new RegExp(options.jsonPrefix), "").trim();
	let tokens;
	if (detectJson(rawText)) {
		return {
			text: rawText,
			offset: initialRawText.indexOf(rawText)
		};
	} else {
		tokens = rawText.match(/^([^\s(]*)\s*\(([\s\S]*)\)\s*;?$/);
		if (tokens && tokens[1] && tokens[2]) {
			if (detectJson(tokens[2].trim())) {
				return {
					functionName: tokens[1],
					text: tokens[2],
					offset: initialRawText.indexOf(tokens[2])
				};
			}
		}
	}

	function detectJson(text) {
		return (
			(text.charAt(0) == "[" && text.charAt(text.length - 1) == "]") ||
			(text.charAt(0) == "{" && text.charAt(1) != "-" && text.charAt(1) != "%" && text.charAt(text.length - 1) == "}")
		);
	}
}

async function processData(jsonInfo, options) {
	if ((window == top || options.injectInFrame) && jsonInfo && jsonInfo.text) {
		const json = jsonInfo.text;
		const result = await sendMessage({
			jsonToHTML: true,
			json,
			functionName: jsonInfo.functionName,
			supportBigInt
		});
		if (result.html) {
			displayUI(result.stylesheet, result.html, options);
			try {
				if (supportBigInt) {
					jsonObject = parseJson(json);
				} else {
					jsonObject = JSON.parse(json);
				}
			} catch (error) {
				// ignored
			}
		}
		if (result.error) {
			displayError(result.stylesheet, result.error, result.loc, jsonInfo.offset);
		}
	}
}

function displayError(theme, error, loc, offset) {
	const userStyleElement = document.createElement("style");
	const preElement = document.body.firstChild.firstChild;
	const textElement = preElement.textContent.substring(offset);
	const iconElement = document.createElement("span");
	const contentElement = document.createElement("div");
	const errorPositionElement = document.createElement("span");
	const containerElement = document.createElement("div");
	const closeButtonElement = document.createElement("div");
	const range = document.createRange();
	const ranges = [];
	let startRange = 0, indexRange = 0;
	userStyleElement.appendChild(document.createTextNode(theme));
	document.head.appendChild(userStyleElement);
	while (indexRange != -1) {
		indexRange = textElement.indexOf("\n", startRange);
		ranges.push(startRange);
		startRange = indexRange + 1;
	}
	startRange = ranges[loc.first_line - 1] + loc.first_column + offset;
	const endRange = ranges[loc.last_line - 1] + loc.last_column + offset;
	range.setStart(preElement, startRange);
	if (startRange == endRange - 1) {
		range.setEnd(preElement, startRange);
	} else {
		range.setEnd(preElement, endRange);
	}
	errorPositionElement.className = "error-position";
	range.surroundContents(errorPositionElement);
	iconElement.className = "error-icon";
	iconElement.textContent = "⚠";
	errorPositionElement.insertBefore(iconElement, errorPositionElement.firstChild);
	contentElement.className = "content";
	closeButtonElement.className = "close-error";
	closeButtonElement.addEventListener("click", onCloseError, false);
	contentElement.textContent = error;
	contentElement.appendChild(closeButtonElement);
	containerElement.className = "container";
	containerElement.appendChild(contentElement);
	errorPositionElement.parentNode.insertBefore(containerElement, errorPositionElement.nextSibling);
	displayToolbox(true);

	function onCloseError(event) {
		if (event.isTrusted) {
			contentElement.parentElement.removeChild(contentElement);
		}
	}
}

function displayUI(stylesheet, html, options) {
	document.body.removeAttribute("style");
	const userStyleElement = document.createElement("style");
	statusElement = document.createElement("div");
	userStyleElement.appendChild(document.createTextNode(stylesheet));
	document.head.appendChild(userStyleElement);
	document.body.innerHTML = html;
	collapserElements = document.querySelectorAll("#json .collapsible .collapsible");
	if (options.maxDepthLevelExpanded) {
		let selectorsCollapsedElements = "#json .collapsible ";
		for (let indexLevel = 0; indexLevel < options.maxDepthLevelExpanded; indexLevel++) {
			selectorsCollapsedElements += ".collapsible ";
		}
		document.querySelectorAll(selectorsCollapsedElements).forEach(element => element.parentElement.classList.add("collapsed"));
	}
	statusElement.className = "status";
	document.body.appendChild(statusElement);
	document.body.addEventListener("mouseover", onMouseMove, false);
	document.body.addEventListener("click", onMouseClick, false);
	document.body.addEventListener("contextmenu", onContextMenu, false);
	document.body.addEventListener("click", onToggleCollapsible, false);
	displayToolbox();
}

function displayToolbox(onlyViewSource) {
	const viewSourceElement = document.createElement("a");
	const toolboxElement = document.createElement("div");
	let openCollapsiblesElement, closeCollapsiblesElement;
	if (!onlyViewSource) {
		openCollapsiblesElement = document.createElement("span");
		closeCollapsiblesElement = document.createElement("span");
		closeCollapsiblesElement.title = TITLE_CLOSE_COLLAPSIBLES;
		closeCollapsiblesElement.innerText = LABEL_CLOSE_COLLAPSIBLES;
		openCollapsiblesElement.title = TITLE_OPEN_COLLAPSIBLES;
		openCollapsiblesElement.innerText = LABEL_OPEN_COLLAPSIBLES;
		openCollapsiblesElement.addEventListener("click", onOpenCollapsibles, false);
		closeCollapsiblesElement.addEventListener("click", onCloseCollapsibles, false);
		toolboxElement.appendChild(openCollapsiblesElement);
	}
	toolboxElement.appendChild(viewSourceElement);
	if (!onlyViewSource) {
		toolboxElement.appendChild(closeCollapsiblesElement);
	}
	document.body.appendChild(toolboxElement);
	toolboxElement.className = "toolbox";
	viewSourceElement.title = TITLE_VIEW_SOURCE;
	viewSourceElement.innerText = LABEL_VIEW_SOURCE;
	viewSourceElement.addEventListener("click", onViewSource, false);
}

function onToggleCollapsible(event) {
	if (event.isTrusted) {
		const target = event.target;
		if (target.className == "collapser") {
			const collapsed = target.parentNode.getElementsByClassName("collapsible")[0];
			collapsed.parentNode.classList.toggle(CLASS_COLLAPSED);
			event.stopImmediatePropagation();
		}
	}
}

function onOpenCollapsibles(event) {
	if (event.isTrusted) {
		collapserElements.forEach(collapsed => collapsed.parentNode.classList.remove(CLASS_COLLAPSED));
	}
}

function onCloseCollapsibles(event) {
	if (event.isTrusted) {
		collapserElements.forEach(collapsed => collapsed.parentNode.classList.add(CLASS_COLLAPSED));
	}
}

function onViewSource(event) {
	if (event.isTrusted) {
		document.body.replaceWith(originalBody);
	}
}

function onMouseMove(event) {
	if (event.isTrusted) {
		jsonPath = "";
		let element = getParentListItem(event.target);
		if (element && event.target.tagName != TAG_LIST_ITEM) {
			jsonSelector = [];
			if (hoveredListItem) {
				hoveredListItem.firstChild.classList.remove(CLASS_HOVERED);
			}
			hoveredListItem = element;
			element.firstChild.classList.add(CLASS_HOVERED);
			do {
				if (element.parentNode.classList.contains("array")) {
					const index = [].indexOf.call(element.parentNode.children, element);
					jsonPath = "[" + index + "]" + jsonPath;
					jsonSelector.unshift(index);
				}
				if (element.parentNode.classList.contains("obj")) {
					const key = element.firstChild.firstChild.innerText;
					if (REGEXP_IDENTIFIER.test(key)) {
						jsonPath = "." + key + jsonPath;
					} else {
						jsonPath = "[" + JSON.stringify(key) + "]" + jsonPath;
					}
					jsonSelector.unshift(key);
				}
				element = element.parentNode.parentNode.parentNode;
			} while (element.tagName == TAG_LIST_ITEM);
			if (jsonPath.charAt(0) == ".") {
				jsonPath = jsonPath.substring(1);
			}
			statusElement.innerText = jsonPath;
		} else if (hoveredListItem) {
			hoveredListItem.firstChild.classList.remove(CLASS_HOVERED);
			hoveredListItem = null;
			statusElement.innerText = "";
			jsonSelector = [];
		}
	}
}

function onMouseClick(event) {
	if (event.isTrusted) {
		const previousSelectedListItem = selectedListItem;
		if (selectedListItem) {
			selectedListItem.firstChild.classList.remove(CLASS_SELECTED);
			selectedListItem = null;
		}
		const newSelectedListItem = getParentListItem(event.target);
		if (newSelectedListItem && previousSelectedListItem != newSelectedListItem) {
			selectedListItem = newSelectedListItem;
			selectedListItem.firstChild.classList.add(CLASS_SELECTED);
		}
	}
}

function onContextMenu(event) {
	if (event.isTrusted) {
		copiedSelector = jsonSelector ? Array.from(jsonSelector) : [];
	}
}

function getParentListItem(element) {
	if (element.tagName != TAG_LIST_ITEM) {
		while (element && element.tagName != TAG_LIST_ITEM) {
			element = element.parentNode;
		}
	}
	if (element && element.tagName == TAG_LIST_ITEM) {
		return element;
	}
}

function copyText(value) {
	const command = "copy";
	document.addEventListener(command, listener);
	document.execCommand(command);
	document.removeEventListener(command, listener);

	function listener(event) {
		event.clipboardData.setData("text/plain", value);
		event.preventDefault();
	}
}

function sendMessage(message) {
	return new Promise(resolve => chrome.runtime.sendMessage(message, result => resolve(result)));
}