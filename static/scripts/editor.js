// bbCode control by
// subBlue design
// www.subBlue.com
// slightly edited by GribUser and Aragaer

// Startup variables
var imageTag = false;
var theSelection = false;

// More details from: http://www.mozilla.org/docs/web-developer/sniffer/browser_type.html
var clientPC = navigator.userAgent.toLowerCase(); // Get client info
var clientVer = parseInt(navigator.appVersion); // Get browser version

var is_ie = ((clientPC.indexOf("msie") != -1) && (clientPC.indexOf("opera") == -1));
var is_nav = ((clientPC.indexOf('mozilla')!=-1) && (clientPC.indexOf('spoofer')==-1)
                && (clientPC.indexOf('compatible') == -1) && (clientPC.indexOf('opera')==-1)
                && (clientPC.indexOf('webtv')==-1) && (clientPC.indexOf('hotjava')==-1));
var is_moz = 0;

var is_win = ((clientPC.indexOf("win")!=-1) || (clientPC.indexOf("16bit") != -1));
var is_mac = (clientPC.indexOf("mac")!=-1);

// Define the bbCode tags
bbcode = new Array();
bbtags = new Array('[b]','[/b]','[i]','[/i]','[quote]','[/quote]','[ol]','[/ol]','[ul]','[/ul]','[url]','[/url]','[planet=',']','[img]','[/img]','[player]','[/player]','[style=font-size:80%]','[/style]', '[spoiler='+TitleString+']', '[/spoiler]');
imageTag = false;

// Shows the help messages in the helpline window
function helpline(help) {
	document.getElementById('helpbox').innerHTML=eval("help_"+help);
}


// Replacement for arrayname.length property
function getarraysize(thearray) {
	for (i = 0; i < thearray.length; i++) {
		if ((thearray[i] == "undefined") || (thearray[i] == "") || (thearray[i] == null))
			return i;
		}
	return thearray.length;
}

// Replacement for arrayname.push(value) not implemented in IE until version 5.5
// Appends element to the array
function arraypush(thearray,value) {
	thearray[ getarraysize(thearray) ] = value;
}

// Replacement for arrayname.pop() not implemented in IE until version 5.5
// Removes and returns the last element of an array
function arraypop(thearray) {
	thearraysize = getarraysize(thearray);
	retval = thearray[thearraysize - 1];
	delete thearray[thearraysize - 1];
	return retval;
}


function checkForm() {

	formErrors = false;

	if (document.post.message.value.length < 2) {
		formErrors = EmptyMsgWarning;
	}
	if (document.post.to && document.post.to.value.length == 0) {
		formErrors = NoRecipientWarning;
	}
	if (document.post.topic_subject && (document.post.topic_subject.value.length<2 ||
		!document.post.topic_subject.value.match(/[^\s]+/))) formErrors = NoSubjectWarning;
	if (formErrors) {
		alert(formErrors);
		return false;
	} else {
		bbstyle(-1);
		//formObj.preview.disabled = true;
		//formObj.submit.disabled = true;
		return true;
	}
}

function emoticon(text) {
	var txtarea = document.post.message;
	text = ' ' + text + ' ';
  //IE support
  if (document.selection) {
    txtarea.focus();
    sel = document.selection.createRange();
    sel.text = text;
  }
  //MOZILLA/NETSCAPE support
  else if (txtarea.selectionStart || txtarea.selectionStart == '0') {
    var startPos = txtarea.selectionStart;
    var endPos   = txtarea.selectionEnd;
    txtarea.value = txtarea.value.substring(0, startPos)
      + text
      + txtarea.value.substring(endPos, txtarea.value.length);
  } else {
  // Unknown browser
    txtarea.value += text;
  }
}


function bbstyle(bbnumber) {
	var txtarea = document.post.message;

	txtarea.focus();
	donotinsert = false;
	theSelection = false;
	bblast = 0;

	if (bbnumber == -1) { // Close all open tags and default button names
		while (bbcode[0]) {
			butnumber = arraypop(bbcode) - 1;
			txtarea.value += bbtags[butnumber + 1];
			buttext = eval('document.post.addbbcode' + butnumber + '.value');
			eval('document.post.addbbcode' + butnumber + '.value ="' + buttext.substr(0,(buttext.length - 1)) + '"');
		}
		imageTag = false; // All tags are closed including image tags :D
		txtarea.focus();
		return;
	}

	if ((clientVer >= 4) && is_ie && is_win)
	{
		theSelection = document.selection.createRange().text; // Get text selection
		if (theSelection) {
			// Add tags around selection
			document.selection.createRange().text = bbtags[bbnumber] + theSelection + bbtags[bbnumber+1];
			txtarea.focus();
			theSelection = '';
			return;
		}
	}
	else if (txtarea.selectionEnd && (txtarea.selectionEnd - txtarea.selectionStart > 0))
	{
		mozWrap(txtarea, bbtags[bbnumber], bbtags[bbnumber+1]);
		return;
	}

	// Find last occurance of an open tag the same as the one just clicked
	for (i = 0; i < bbcode.length; i++) {
		if (bbcode[i] == bbnumber+1) {
			bblast = i;
			donotinsert = true;
		}
	}

	if (donotinsert) {		// Close all open tags up to the one just clicked and default button names
		while (bbcode[bblast]) {
				butnumber = arraypop(bbcode) - 1;
				txtarea.value += bbtags[butnumber + 1];
				buttext = eval('document.post.addbbcode' + butnumber + '.value');
				eval('document.post.addbbcode' + butnumber + '.value ="' + buttext.substr(0,(buttext.length - 1)) + '"');
				imageTag = false;
			}
			txtarea.focus();
			return;
	} else { // Open tags

		if (imageTag && (bbnumber != 14)) {		// Close image tag before adding another
			txtarea.value += bbtags[15];
			lastValue = arraypop(bbcode) - 1;	// Remove the close image tag from the list
			document.post.addbbcode14.value = "Img";	// Return button back to normal state
			imageTag = false;
		}

		// Open tag
		txtarea.value += bbtags[bbnumber];
		if (bbnumber == 12) txtarea.value += 'X:Y';
		if ((bbnumber == 14) && (imageTag == false)) imageTag = 1; // Check to stop additional tags after an unclosed image tag
		arraypush(bbcode,bbnumber+1);
		eval('document.post.addbbcode'+bbnumber+'.value += "*"');
		txtarea.focus();
		return;
	}
	storeCaret(txtarea);
}

// From http://www.massless.org/mozedit/
function mozWrap(txtarea, open, close)
{
	var selLength = txtarea.textLength;
	var selStart = txtarea.selectionStart;
	var selEnd = txtarea.selectionEnd;
	if (selEnd == 1 || selEnd == 2)
		selEnd = selLength;

	var s1 = (txtarea.value).substring(0,selStart);
	var s2 = (txtarea.value).substring(selStart, selEnd)
	var s3 = (txtarea.value).substring(selEnd, selLength);
	txtarea.value = s1 + open + s2 + close + s3;
	return;
}

// Insert at Claret position. Code from
// http://www.faqts.com/knowledge_base/view.phtml/aid/1052/fid/130
function storeCaret(textEl) {
	if (textEl.createTextRange) textEl.caretPos = document.selection.createRange().duplicate();
}
var selection;
function get_selection() {
	if (document.getSelection){
		if(document.getSelection().createRange){selection = document.getSelection().createRange().text;}
		else{ selection = document.getSelection()+''}
	}	else if (document.selection && document.selection.createRange()) {selection = document.selection.createRange().text;}
	else if (window.getSelection){ selection=window.getSelection(); }
}

function Quote(name){
	if (selection){
		if(document.getElementById('news_body_row_1') &&
			!(document.getElementById('news_body_row_1').style.display=='block')) ExpandNewsItem(1);
		NV=document.post.message.value==''?'':'\n';
		if(BrowserDetect.browser != 'Explorer' && BrowserDetect.isOk() != 1)
			selection = selection.replace(/((\r\r|\n\n|\r\n){2})/g, "\n");
		document.post.message.value+=(NV+'[quote'+(name ? '="'+name+'"' : '')+']' + selection + '[/quote]\n');
		selection = '';
		document.post.message.focus();
		document.post.message.scrollIntoView();
	}else alert(NoTextTelectedStr);
}
