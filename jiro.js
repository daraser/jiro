/*!
------------------------------------------------------------------------------
jiro v1.0.0
Written by Darius Aseriskis
Licensed under MIT
------------------------------------------------------------------------------
*/
(function() {
	"use strict";

	var command = /\{\{?([`/?~!@#$%^&*+=])?([`/?~!@#$%^&*+=])?\s*([\s\S]*?)\s*([`/?~!@#$%^&*+=])?\}\}/g;
	var lang = {};

	var jiro = {
		varname : 'it',
		context : "def",
		extend : function(patterns){
			for ( var i in patterns ) {
				lang[i] = patterns[i];
			}
		},
		attach : function(pattern, fn){
			lang[pattern]['debug'] = fn;
		},
		trim : function(str){
			return str.replace(/^\s+|\s+$/g, '');
		},
		isU : function(a){
			return typeof a === 'undefined';
		},
		template : function(templ){
			var that = this;
			var str = templ;

			var context = [];

			for(var i in lang){
				if(!that.isU(lang[i].init))
					context.push(lang[i].init());
			}

			str = ("var out='" + str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g,' ')
				.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,'')
				.replace(/'|\\/g, '\\$&') // not sure what it does	
				.replace(command, function(all, first, second, code, last){
					var pattern = 
						[
							'{{',
							that.isU(first) ? '' : first,
							that.isU(second) ? '' : second,
							(that.isU(code) || (!that.isU(code)  && that.trim(code).length == 0)) ? '' :'{code}',
							that.isU(last) ? '' : last, 
							'}}'
						].join('');
					var obj = lang[pattern];

					if(!that.isU(obj) && !that.isU(obj.exec)){
						var bool = true;
						if(!that.isU(obj.debug))
							bool = obj.debug(pattern, code, templ);
						return ((bool == null || bool == true)? obj.exec(pattern, code) : bool);
					}else{
						that.debug && that.debug.error('No such pattern: ' + pattern, { code : code, match : all, template : templ});
						return '';
					}
						
				})+ "';return out;");
			str = "var "+jiro.context+" = {" + context.join(',') + '};' + str;

			if(!that.isU(that.debug) && !that.isU(that.debug.format))
				str = that.debug.format(str);
			try {
				if(that.isU(that.debug) || (!that.isU(that.debug) && that.debug.finish(str, templ)))
					return new Function(jiro.varname, str);
				return function(){return 'Debugger found an issue. Check for console for errors.'};
			} catch (e) {

				that.debug && that.debug.error("Could not create a template function: \n"+str); 
				throw e;
			}
		}
	};

	// node and window exports
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = jiro;
	} else {
		(function(){ return this || (0,eval)('this'); }()).jiro = jiro;
	}


	jiro.extend({
		'{{{code}}}' : {
			exec : function(pattern, code){
				return "';" + unescape(code) + "out+='";	
			}
		},
		'{{={code}}}': {
			exec : function(pattern, code){ 
				return "'+(" + unescape(code) + ")+'";
			}
		},
		'{{?{code}}}' : {
			exec : function(pattern, code){
				return "';if(" + unescape(code) + "){out+='";
			}
		},
		'{{?}}' : {
			exec : function(pattern, code){
				return "';}out+='";
			}
		},
		'{{??}}' : {
			exec : function(pattern, code){
				return "';}else{out+='";
			}
		},
		'{{??{code}}}' : {
			exec : function(pattern, code){
				return "';}else if(" + unescape(code) + "){out+='"; 
			}
		},
		'{{~{code}}}' : {
			exec : function(pattern, code){
				var parts = code.split(':');
				return "';"+jiro.context+".iterate("+unescape(parts[0])+", function(" + parts[1] +"){ out+='";
			},
			init : function(){
				return "iterate : " + 
					(function(obj, fn){
						if(obj instanceof Array)
							for(var i = 0; i < obj.length; i++) {fn(i, obj[i]);}
						else
							for(var i in obj) {fn(i, obj[i]);}
					}).toString();
			}
		},
		'{{~}}' : {
			exec : function(pattern, code){
				return "';});out+='";
			}
		},
		'{{`{code}}}' : {
			exec : function(pattern, code){
				return '';
			}
		},
		'{{#{code}}}' : {
			exec : function(pattern, code){
				var parts = code.split(':');
				return "';var "+ jiro.trim(unescape(parts[0])) +"= function("+(parts.length > 1 ? parts[1] : '')+"){out+='";
			}
		},
		'{{#}}' : {
			exec : function(pattern, code){
				return "';};out+='";
			}
		},
		'{{!{code}}}' : {
			exec : function(pattern, code){
				return "'+("+jiro.context+".encode(" + unescape(code) + "))+'";
			},
			init : function(){
				return "encode : "+ 
				(function(str) {
					var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": "&#39;", "/": "&#47;" },
						matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
					return str.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;});
				}).toString();
			}
		}

	});
})();
