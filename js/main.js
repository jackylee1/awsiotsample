const thingName = "cabinetIoT";
const endpoint = "a26ho2ufth6bld.iot.us-east-1.amazonaws.com";
const endpointURL = "https://" + endpoint + "/things/" + thingName;

$(()=>{

	initLed();
	function initLed(){
		$.ajax({
			type: "POST",
			url: "/get"
		})
		.done(function(data, status, xhr){		
			console.log("done", data);
			var stat = data.state.reported.pin;
			$('.btnAction.led').addClass(stat[1]).val(stat[1]);
		})
		.fail(function(xhr, status, err){
			console.log('fail');
		})
		.always(function(){
			console.log('always');
		});
	}
	
	$('.btnAction').each(function(i, o){
		var $this = $(o);
		console.log($this);
		$this.click(()=>{
			var action = $this.data('action');
			var v = $this.val();
			var pin = $this.attr('name');
			$this.removeClass(v);
			v = (v == 'off') ? 'on' : 'off';
			$this.addClass(v);
			$this.val(v);

			console.log('=> action ', action);
			console.log('=> value ', v);
			if (action){
				$.ajax({
					type: "POST",
					url: "/" + action,
					data: {'pin' : pin, 'status' : v}
				})
				.done(function(data, status, xhr){
					console.log("done");
				})
				.fail(function(xhr, status, err){
					console.log('fail');
				})
				.always(function(){
					console.log('always');
				});
			}
		});
	});
});