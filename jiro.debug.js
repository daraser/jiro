/*!
------------------------------------------------------------------------------
jiro debugger v1.0.0
Written by Darius Aseriskis
Licensed under MIT
------------------------------------------------------------------------------
*/
// node and window exports
if (typeof module !== 'undefined' && module.exports) {
	var jiro = require('./jiro.js');
	module.exports = jiro;
}

(function(jiro){

	var executionStack = {}; 

	jiro.debug = {
		error : function(msg, data){
			var lines = [];
			if(!jiro.isU(data)) lines = this.findLine(data);
			console.error && console.error('ERROR: ' + msg + '\n\t'+ lines.join('\n\t'));
		},
		warn : function(msg, data){
			var lines = [];
			if(!jiro.isU(data)) lines = this.findLine(data);
			console.warn && console.warn('WARNING: ' + msg + '\n\t'+ lines.join('\n\t'));
		},
		findLine : function(data){
			var lines = data.template.replace(/\n\r/g, '\n').split('\n');
			result = [];
			for(var i = 0; i < lines.length; i++){
				var column = lines[i].lastIndexOf(data.match); 
				if( column != -1)
					result.push(data.match + ' || Matched at line ' + (i+1) + ' column '+ column);
			}
			return result;
		},
		push : function(name, data){
			if(jiro.isU(executionStack[name])) executionStack[name] = [];
			executionStack[name].push(data);
		},
		pop : function(name){
			return executionStack[name].pop(data);
		},
		clear : function(name){
			executionStack[name] = [];	
		},
		getAll : function(name){
			var code = '';
			if(executionStack[name] != null &&  executionStack[name].length > 0){
				for(var i = 0; i < executionStack[name].length; i++){
					code += executionStack[name][i];
				}
			}
			return code;
		},
		getStack : function(name){
			var stack = [];
			for(var i = 0; i < executionStack[name].length; i++){
				stack.push({ "key" : name, "value" : executionStack[name][i], "full" : name.replace('{code}', executionStack[name][i])});
			}
			return stack;
		},
		checkCount : function(code){
			var count = {};
			for(var i = 0; i < code.length; i++){
				count[code[i]] = count[code[i]] != null ? count[code[i]]++ : 1; 
			}
			return count['{'] == count['}'] && count['('] == count[')'];
		},
		errors : [],
		finish : function(code, templ){
			var that = this;
			for(var i in executionStack){
				if(executionStack[i] != null && executionStack[i].length != 0){
					var stack = that.getStack(i);
					var log = '\n\t'
					if(stack != null){
						for(var j = 0; j < stack.length; j++){
							var b = {code : stack[j].value, match : stack[j].value, template : templ};
							log += that.findLine(b).join('\n\t');
						}
					}
					that.errors.push('There are not closed statements in ' + i + log);
				}
			}

			for(var i in that.callbacks){
				if(that.callbacks[i] != null && that.callbacks[i].length != 0){
					var log = '\n\t'
					for(var j = 0; j <  that.callbacks[i].length; j++){
						log += that.findLine(that.callbacks[i][j](false)).join('\n\t');
					}
					that.errors.push('There is conditional, iterational or partials template not closed. '+ i + log);
				}
			}


			if(that.errors.length > 0){
				for(var i = 0; i < that.errors.length; i++)
					that.error(that.errors[i]);
				return false;
			}else{
				return true;
			}

		},

		openCloseCheck : function(pattern, code, templ){
			var that = this;
			that.push(pattern, code);
			var a = that.getAll(pattern);
			if(that.checkCount(a)){
				var stack = that.getStack(pattern);
				that.clear(pattern);
				try{
					var fn = new Function(jiro.varname, a);
				}
				catch(e){
					var log = '\n\t'
					if(stack != null){
						for(var i = 0; i < stack.length; i++){
							var b = {code : stack[i].value, match : stack[i].full, template : templ};
							log += that.findLine(b).join('\n\t');
						}
					}
					that.errors.push('There seems to be an error in pattern: ' + e.toString() + log);
				}
			}
		},

		callbacks : {},

		check : function(pattern){
			var that = this;
			if(that.callbacks[pattern]){
				that.callbacks[pattern].pop()(true);
			}
		},

		listen : function(pattern, fn){
			var that = this;
			if(jiro.isU(that.callbacks[pattern]))
				that.callbacks[pattern] = [];
			that.callbacks[pattern].push(fn);
		},

		codeCheck : function(pattern, code, templ){
			try{
				new Function(jiro.varname, code);
			}
			catch(e){
				that.errors.push('There template code fails to compile. \n\t' + that.findLine({code : code, match : pattern, template : templ}).join('\n\t'));
			}
			 
		}
	};

	jiro.attach('{{{code}}}', function(pattern, code, templ){
		var that = jiro.debug;
		var stack = null;
		if(!jiro.isU(that)){
			that.check(pattern);
			that.openCloseCheck(pattern, code, templ)
		}
	});

	jiro.attach('{{~{code}}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
			that.listen('{{~}}', function(closing){
				if(!closing){
					return {code : code, match : pattern, template : templ};
				}
			});
			if(code.split(':').length > 2)
				that.errors.push('There is a problem with ":" in template pattern. \n\t' + that.findLine({code : code, match : pattern, template : templ}).join('\n\t'));
			that.codeCheck(pattern, code.split(':')[0], templ);
		}
	});

	jiro.attach('{{~}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
		}
	});

	jiro.attach('{{?{code}}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
			that.listen('{{?}}', function(closing){
				if(!closing){
					return {code : code, match : pattern, template : templ};
				}
			});

			that.codeCheck(pattern, code, templ);
		}

	});

	jiro.attach('{{?}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
		}
	});

	jiro.attach('{{??{code}}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
			that.codeCheck(pattern, code, templ);
		}
	});

	jiro.attach('{{#{code}}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
			that.listen('{{#}}', function(closing){
				if(!closing){
					return {code : code, match : pattern, template : templ};
				}
			});

			if(code.split(':').length > 2)
				that.errors.push('There is a problem with ":" in template pattern. \n\t' + that.findLine({code : code, match : pattern, template : templ}).join('\n\t'));
		}
	});

	jiro.attach('{{#}}', function(pattern, code, templ){
		var that = jiro.debug;
		if(!jiro.isU(that)){
			that.check(pattern);
		}
	});


})(jiro);
