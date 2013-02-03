var assert = require('chai').assert;
//var jiro = require('../jiro.js');
var jiro = require('../jiro.debug.js');

describe('Jiro', function(){
	var data = {
		index : 0,
		array :[
			'A',
			'B',
			'C'
		],
		object :{
			'first' : 'A',
			'second' : 'B',
			'third' : 'C'
		},
		text : '<div>Hello</div>'





	};
	describe('code', function(){
		it('HTML expression', function(){
			data.index = 0;
			var tmp = jiro.template('<div>{{ it.index = 1; }}</div>');
			assert.equal('<div></div>',tmp(data));
			assert.equal(1,data.index);
		});

		it('expression only', function(){
			data.index = 0;
			var tmp = jiro.template('{{it.index = 2;}}');
			assert.equal('',tmp(data));
			assert.equal(2,data.index);
		});
	});

	describe('evaluation', function(){
		it('simple', function(){
			data.index = 0;
			var tmp = jiro.template('<div>{{=it.index}}</div>');
			assert.equal('<div>0</div>',tmp(data));
		});
		it('advanced', function(){
			data.index = 0;
			var tmp = jiro.template('<div>{{=it.index == 0 ? "Y": "N" }}</div>');
			assert.equal('<div>Y</div>',tmp(data));
		});
	});

	describe('condition', function(){
		it('simple', function(){
			var tmp = jiro.template('<div>{{?it.index == 0}}A{{??}}B{{?}}</div>');
			data.index = 0;
			assert.equal('<div>A</div>',tmp(data));
			data.index = 1;
			assert.equal('<div>B</div>',tmp(data));
		});
		it('advanced', function(){
			var tmp = jiro.template('<div>{{?it.index == 0}}A{{??}}{{?it.index == 2}}C{{?}}{{?}}</div>');
			data.index = 0;
			assert.equal('<div>A</div>',tmp(data));
			data.index = 1;
			assert.equal('<div></div>',tmp(data));
			data.index = 2;
			assert.equal('<div>C</div>',tmp(data));
		});

		it('else if', function(){
			var tmp = jiro.template('<div>{{?it.index == 0}}A{{??it.index == 2}}C{{?}}</div>');
			data.index = 0;
			assert.equal('<div>A</div>',tmp(data));
			data.index = 1;
			assert.equal('<div></div>',tmp(data));
			data.index = 2;
			assert.equal('<div>C</div>',tmp(data));
		});
	});
	describe('iteration', function(){
		it('array', function(){
			var tmp = jiro.template('<div>{{~it.array: i,j}}{{=i}}:{{=j}}{{~}}</div>');
			assert.equal('<div>0:A1:B2:C</div>',tmp(data));
		});
		it('object', function(){
			var tmp = jiro.template('<div>{{~it.object: i,j}}{{=i}}:{{=j}}{{~}}</div>');
			assert.equal('<div>first:Asecond:Bthird:C</div>',tmp(data));
		});
	});

	describe('encode', function(){
		it('html', function(){
			var tmp = jiro.template('<div>{{!!it.text}}</div>');
			assert.equal('<div>&#60;div&#62;Hello&#60;&#47;div&#62;</div>',tmp(data));
		});
	});

	describe('comment', function(){
		it('simple', function(){
			var tmp = jiro.template('<div>{{`it.text}}</div>');
			assert.equal('<div></div>',tmp(data));
		});
	});

	describe('macro', function(){
		it('simple', function(){
			data.index = 0;
			var tmp = jiro.template('{{#tmp:i}}<div>{{=i}}</div>{{#}}{{##tmp(it.index)}}');	
			assert.equal('<div>0</div>',tmp(data));
		});
	});

	describe('qoutes', function(){
		it('first', function(){
			data.index = 0;
			try{
			//var tmp = jiro.template("<div>{{= 'i'}}</div>");	
			console.log(e.toString());		
			}
			catch(e){
			console.log(jiro.template("<div>{{= 'i'}}</div>"));	
			}
			
			//assert.equal('<div>i</div>',tmp(data));
		});
	});


});