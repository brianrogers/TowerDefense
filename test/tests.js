
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

// below are some general tests but feel free to delete them.

// these test things from plugins.js
test("Environment is good",function(){
  expect(3);
  ok( !!window.log, "log function present");
  
  var history = log.history && log.history.length || 0;
  log("logging from the test suite.")
  equals( log.history.length - history, 1, "log history keeps track" )
  
  ok( !!window.Modernizr, "Modernizr global is present")
})

test("Create New TowerDefense", function(){
	ok(window.TowerDefense, "window.TowerDefense is present")
	TowerDefense.init(Level1);
	
	
});

test("Array Includes", function(){
	ok(window.TowerDefense.ArrayIncludes([1,2,3],2),"2 is included in [1,2,3]");
})

test("Range Array", function(){
	equals(TowerDefense.GetRangeArray(3,2).toString(), "1,2,3,4,5"  ,"range should be [1,2,3,4,5]");
})
