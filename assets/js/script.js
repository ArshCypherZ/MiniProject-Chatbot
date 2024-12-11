import { GoogleGenerativeAI } from "@google/generative-ai";


$(document).ready(function() {
    const genAI = new GoogleGenerativeAI("AIzaSyBpkvz_iG8tQWOHmnzGN5CCsj7JIWB_P4Q");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Dynamic HTML bot content (Widget style)
    var mybot = `
        <div class="chatCont" id="chatCont">
            <div class="bot_profile">
                <img src="assets/img/bot2.svg" class="bot_p_img">
                <div class="close">
                    <i class="fa fa-times" aria-hidden="true"></i>
                </div>
            </div>
            <div id="result_div" class="resultDiv"></div>
            <div class="chatForm" id="chat-div">
                <div class="spinner">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                </div>
                <input type="text" id="chat-input" autocomplete="off" placeholder="Try typing here" class="form-control bot-txt"/>
            </div>
        </div>
        <div class="profile_div">
            <div class="row">
                <div class="col-hgt">
                    <img src="assets/img/bot2.svg" class="img-circle img-profile">
                </div>
                <div class="col-hgt">
                    <div class="chat-txt">Chat with us now!</div>
                </div>
            </div>
        </div>`;
    
    $("mybot").html(mybot);

    // Toggle chatbot
    $('.profile_div').click(function() {
        $('.profile_div').toggle();
        $('.chatCont').toggle();
        $('.bot_profile').toggle();
        $('.chatForm').toggle();
        document.getElementById('chat-input').focus();
    });

    $('.close').click(function() {
        $('.profile_div').toggle();
        $('.chatCont').toggle();
        $('.bot_profile').toggle();
        $('.chatForm').toggle();
    });

    // Session initialization
    var session = function() {
        if (sessionStorage.getItem('session')) {
            return sessionStorage.getItem('session');
        } else {
            var session_id = Math.floor((Math.random() * 1000) + 1) + new Date().toLocaleString();
            sessionStorage.setItem('session', session_id);
            return session_id;
        }
    };

    var mysession = session();

    // On input enter
    $('#chat-input').on('keyup keypress', async function(e) {
        var keyCode = e.keyCode || e.which;
        var text = $("#chat-input").val();
        if (keyCode === 13 && text.trim() !== "") {
            $("#chat-input").blur();
            setUserResponse(text);

            // Use Generative AI for response
            try {
                const chat = model.startChat({
                    history: [
                        {
                            role: "user",
                            parts: [{ text: "Hello" }],
                        },
                        {
                            role: "model",
                            parts: [{ text: "Great to meet you. What would you like to know?" }],
                        },
                    ],
                });
                const result = await chat.sendMessage(text);
                setBotResponse(result.response.text());
            } catch (error) {
                console.error("Error with Generative AI:", error);
                setBotResponse("Sorry, there was an issue processing your request.");
            }
            
            // send(text);
            e.preventDefault();
        }
    });

    // Set bot response
    function setBotResponse(val) {
        setTimeout(function() {
            if ($.trim(val) === '') {
                val = 'I couldn\'t get that. Let\'s try something else!';
            }
            var BotResponse = '<p class="botResult">' + val + '</p><div class="clearfix"></div>';
            $(BotResponse).appendTo('#result_div');
            scrollToBottomOfResults();
            hideSpinner();
        }, 500);
    }

    // Set user response
    function setUserResponse(val) {
        var UserResponse = '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>';
        $(UserResponse).appendTo('#result_div');
        $("#chat-input").val('');
        scrollToBottomOfResults();
        showSpinner();
    }

	//---------------------------------- Scroll to the bottom of the results div -------------------------------
	function scrollToBottomOfResults() {
		var terminalResultsDiv = document.getElementById('result_div');
		terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
	}


	//---------------------------------------- Ascii Spinner ---------------------------------------------------
	function showSpinner() {
		$('.spinner').show();
	}
	function hideSpinner() {
		$('.spinner').hide();
	}


	//------------------------------------------- Suggestions --------------------------------------------------
	function addSuggestion(textToAdd) {
		setTimeout(function() {
			var suggestions = textToAdd.replies;
			var suggLength = textToAdd.replies.length;
			$('<p class="suggestion"></p>').appendTo('#result_div');
			$('<div class="sugg-title">Suggestions: </div>').appendTo('.suggestion');
			// Loop through suggestions
			for(i=0;i<suggLength;i++) {
				$('<span class="sugg-options">'+suggestions[i]+'</span>').appendTo('.suggestion');
			}
			scrollToBottomOfResults();
		}, 1000);
	}

	// on click of suggestions get value and send to API.AI
	$(document).on("click", ".suggestion span", function() {
		var text = this.innerText;
		setUserResponse(text);
		send(text);
		$('.suggestion').remove();
	});
	// Suggestions end -----------------------------------------------------------------------------------------
});
