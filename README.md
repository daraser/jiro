JTL or Jiro Template Language
====

At first this template language is inspired by doT. My goal is to inprove over doT in all posible places:
* Less in size;
* Simple to extend;
* Allow debugging (doT is very weak at this part);
* Allow more plugin's for improving development;

Installation
====
```
	$ npm install jtl
```

Usage:
====
	
* Direct code insersion {{{code}}}:
	
```
	{{
		// any javascript you code
	}}
```

* Eval expression {{={statement}}}:
	
```
	{{= it.Name}}
```

* Conditional statements {{?{condition}}} [{{?? [else condition]}}] {{?}}:
	
```
	{{? it.Name == 'Foo'}}
		My name is Foo.
	{{?? it.Name != 'Boo'}}
		My name isn't Boo
	{{?}}

```
	
* Iteration statements {{~ data : k, v}} {{~}} :

```
	{{~ ['A','B','C'] : k, v}}
		{{=k}} : {{=v}} 
	{{~}}

	{{~ { '0' : 'A', '1' : 'B'} : k, v}}
		{{=k}} : {{=v}} 
	{{~}}
```

* Comments {{`{code}}}:
	
```
	{{` This is a comment and will be thrown away when rendering... `}}
```

* Macros {{# name [: parameters] }} {{#}} {{## name()}}:

```
	{{# foo : p }}
		<p>{{=p}}</p>
	{{#}}

	{{## foo(it.Name)}}
```

* HTML encode content {{!! statement }}
	
```
	{{!! it.Name }}
```

* Empty if null {{!statement}}:

```
	{{!it.Name}}	
```

* Partials in express {{$ <file path> [: data]}}

```
	{{$ ./views/test.jtl : it }}
```

Express integration
====

Comming soon...

Extending 
====

Comming soon...

Debugging
====

Comming soon...
