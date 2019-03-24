
function selectSet() {
	data_id = $('#selectset option:selected').attr('id');
	sessionStorage.setItem('data_id', data_id);
	// console.log("DATASET ID");
	// console.log(data_id)
}
// console.log("DATASET ID OUTSIDE OF FUNCTION");
// console.log(sessionStorage.getItem('data_id'))