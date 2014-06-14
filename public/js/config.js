
window._skel_config = {
	prefix: 'css/style',
	resetCSS: true,
	boxModel: 'border',
	grid: {
		gutters: 50
	},
	breakpoints: {
		'mobile': {
			range: '-480',
			lockViewport: true,
			containers: 'fluid',
			grid: {
				collapse: true,
				gutters: 10
			}
		},
		'desktop': {
			range: '481-',
			containers: 1200
		},
		'1000px': {
			range: '481-1200',
			containers: 960
		}
	}
};

window._skel_panels_config = {
	panels: {
		navPanel: {
			breakpoints: 'mobile',
			position: 'left',
			style: 'reveal',
			size: '80%',
			html: '<div data-action="navList" data-args="nav"></div>'
		}
	},
	overlays: {
		titleBar: {
			breakpoints: 'mobile',
			position: 'top-left',
			height: 44,
			width: '100%',
			html: '<span class="toggle" data-action="panelToggle" data-args="navPanel"></span>'
		}
	}
};

jQuery(function() {
	jQuery.fn.n33_formerize=function(){var _fakes=new Array(),_form = jQuery(this);_form.find('input[type=text],textarea').each(function() { var e = jQuery(this); if (e.val() == '' || e.val() == e.attr('placeholder')) { e.addClass('formerize-placeholder'); e.val(e.attr('placeholder')); } }).blur(function() { var e = jQuery(this); if (e.attr('name').match(/_fakeformerizefield$/)) return; if (e.val() == '') { e.addClass('formerize-placeholder'); e.val(e.attr('placeholder')); } }).focus(function() { var e = jQuery(this); if (e.attr('name').match(/_fakeformerizefield$/)) return; if (e.val() == e.attr('placeholder')) { e.removeClass('formerize-placeholder'); e.val(''); } }); _form.find('input[type=password]').each(function() { var e = jQuery(this); var x = jQuery(jQuery('<div>').append(e.clone()).remove().html().replace(/type="password"/i, 'type="text"').replace(/type=password/i, 'type=text')); if (e.attr('id') != '') x.attr('id', e.attr('id') + '_fakeformerizefield'); if (e.attr('name') != '') x.attr('name', e.attr('name') + '_fakeformerizefield'); x.addClass('formerize-placeholder').val(x.attr('placeholder')).insertAfter(e); if (e.val() == '') e.hide(); else x.hide(); e.blur(function(event) { event.preventDefault(); var e = jQuery(this); var x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]'); if (e.val() == '') { e.hide(); x.show(); } }); x.focus(function(event) { event.preventDefault(); var x = jQuery(this); var e = x.parent().find('input[name=' + x.attr('name').replace('_fakeformerizefield', '') + ']'); x.hide(); e.show().focus(); }); x.keypress(function(event) { event.preventDefault(); x.val(''); }); });  _form.submit(function() { jQuery(this).find('input[type=text],input[type=password],textarea').each(function(event) { var e = jQuery(this); if (e.attr('name').match(/_fakeformerizefield$/)) e.attr('name', ''); if (e.val() == e.attr('placeholder')) { e.removeClass('formerize-placeholder'); e.val(''); } }); }).bind("reset", function(event) { event.preventDefault(); jQuery(this).find('select').val(jQuery('option:first').val()); jQuery(this).find('input,textarea').each(function() { var e = jQuery(this); var x; e.removeClass('formerize-placeholder'); switch (this.type) { case 'submit': case 'reset': break; case 'password': e.val(e.attr('defaultValue')); x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]'); if (e.val() == '') { e.hide(); x.show(); } else { e.show(); x.hide(); } break; case 'checkbox': case 'radio': e.attr('checked', e.attr('defaultValue')); break; case 'text': case 'textarea': e.val(e.attr('defaultValue')); if (e.val() == '') { e.addClass('formerize-placeholder'); e.val(e.attr('placeholder')); } break; default: e.val(e.attr('defaultValue')); break; } }); window.setTimeout(function() { for (x in _fakes) _fakes[x].trigger('formerize_sync'); }, 10); }); return _form; };
	jQuery.browser={};(function(){jQuery.browser.msie=false;jQuery.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)\./)){jQuery.browser.msie=true;jQuery.browser.version=RegExp.$1;}})();

	// Dropdowns
		$('#nav > ul').dropotron({
			offsetX: -2,
			offsetY: -8,
			mode: 'fade',
			noOpenerFade: true,
			hoverDelay: 150,
			hideDelay: 350,
			detach: false
		});

	// Forms (IE <= 9 only)
		if (jQuery.browser.msie && jQuery.browser.version <= 9)
			jQuery('form').n33_formerize();

    $( "#uploadTrigger" ).click(function() {
        $("#UploadBox").removeClass('hide');
    });

    $( "#closePop" ).click(function() {
        $("#UploadBox").addClass('hide');
    });

    window.addEventListener("load", Ready);

    function Ready(){
        if(window.File && window.FileReader){
            document.getElementById('UploadButton').addEventListener('click', StartUpload);
            document.getElementById('FileBox').addEventListener('change', FileChosen);
        }
        else
        {
            document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
        }
    }


    var SelectedFile;

    function FileChosen(evnt) {
        SelectedFile = evnt.target.files[0];
        document.getElementById('NameBox').value = SelectedFile.name;
    }

    var socket = io.connect('http://localhost:3000');
    var FReader;
    var Name;
    function StartUpload(){
        if(document.getElementById('FileBox').value != "")
        {
            FReader = new FileReader();
            Name = document.getElementById('NameBox').value;

            var Content = "<span id='NameArea'>Uploading " + SelectedFile.name + " as " + Name + "</span>";
            Content += '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">50%</span>';
            Content += "<span id='Uploaded'> - <span id='MB'>0</span>/" + Math.round(SelectedFile.size / 1048576) + "MB</span>";

            document.getElementById('UploadArea').innerHTML = Content;

            FReader.onload = function(evnt){
                socket.emit('Upload', { 'Name' : Name, Data : evnt.target.result });
            }
            socket.emit('Start', { 'Name' : Name, 'Size' : SelectedFile.size });
        }
        else
        {
            alert("Please Select A File");
        }
    }

    socket.on('MoreData', function (data){
        UpdateBar(data['Percent']);
        var Place = data['Place'] * 2097152; //The Next Blocks Starting Position
        var NewFile; //The Variable that will hold the new Block of Data
        if(SelectedFile.slice)
            NewFile = SelectedFile.slice(Place, Place + Math.min(2097152, (SelectedFile.size-Place)));
        else
            NewFile = SelectedFile.mozSlice(Place, Place + Math.min(2097152, (SelectedFile.size-Place)));
        FReader.readAsBinaryString(NewFile);
    });
    function UpdateBar(percent){
        document.getElementById('ProgressBar').style.width = percent + '%';
        document.getElementById('percent').innerHTML = (Math.round(percent*100)/100) + '%';
        var MBDone = Math.round(((percent/100.0) * SelectedFile.size) / 1048576);
        document.getElementById('MB').innerHTML = MBDone;
    }

    var Path = "http://localhost/";

    socket.on('Done', function (data){
        var Content = "File Successfully Uploaded !!"
        //Content += "<img id='Thumb' src='" + Path + data['Image'] + "' alt='" + Name + "'><br>";
        //Content += "<button	type='button' name='Upload' value='' id='Restart' class='Button'>Upload Another</button>";
        Content += '<span id="Restart" class="button">Add another file</span>';
        document.getElementById('UploadArea').innerHTML = Content;
        document.getElementById('Restart').addEventListener('click', Refresh);
        document.getElementById('UploadBox').style.width = '270px';
        document.getElementById('UploadBox').style.height = '270px';
        document.getElementById('UploadBox').style.textAlign = 'center';
        document.getElementById('Restart').style.left = '20px';
    });
    function Refresh(){
        //location.reload(true);
        $('#UploadBox');
        var content ='<h3>File Uploader</h3>'
            +'<div id="UploadArea">'
                +'<label for="FileBox">Choose A File: </label><input type="file" id="FileBox"><br>'
                +'<label for="NameBox">Name: </label><input type="text" id="NameBox"><br>'
                  +'  <button type="button" id="UploadButton" class="button">Upload</button>'
                +'</div>';


        document.getElementById('UploadBox').innerHTML= content;
    }


});

