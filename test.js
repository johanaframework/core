

function outerFunction()
{
	var rrr = 123;
	
	innerFunction();
}


function innerFunction()
{
	console.log(rrr);
}

outerFunction();