extern crate rubik;
use rubik::cube;

#[no_mangle]
pub fn add(a: i32, b: i32) -> bool {
	let mut c = cube::Cube::new();
	c.is_solved()
}
