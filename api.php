<?php
	header('Content-type: application/json');

	echo json_encode(
		array("items" =>
			array(
				'one',
				'two',
				'three'
			),
		"other" =>
			array(
				"herp",
				"derp",
				"ferp"
			),
		"test" => "Hello World"
		)
	);

?>