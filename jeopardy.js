// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let base_url = "http://jservice.io";
let response_status = {
  ok: 200,
};

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  let response = null;
  await axios
    .get(`${base_url}/api/categories?count=100`)
    .then((res) => {
      console.log(res);
      // if the api response is 200
      if (res.status === response_status.ok) {
        // get all ids and discard other info
        let ids = res.data.map((category) => category.id);
        // get random 6 ids from the list of category ids
        response = _.sampleSize(ids, 6);
      }
    })
    .catch((err) => {
      console.log(err);
      console.log("Error in calling categories api");
    });

  return response;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  let response = {};
  await axios
    .get(`${base_url}/api/category?id=${catId}`)
    .then((res) => {
      console.log(res);
      // if the api response is 200
      if (res.status === response_status.ok) {
        // get 5 random choices
        let randomChoice = _.sampleSize(res.data.clues, 5);
        // use map function to make list of clue object
        let choices_obj = randomChoice.map((clues) => ({
          question: clues.question,
          answer: clues.answer,
          showing: null,
        }));
        // return data
        response = { title: res.data.title, clues: choices_obj };
      }
    })
    .catch((err) => {
      console.log(err);
      console.log("error in getting data from the api");
    });
  return response;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  hideLoadingView();

  // Add row with headers for categories
  let $tr = $("<tr>");
  for (let category of categories) {
    $tr.append(`<th>${category.title}</th>`);
  }
  // add all categories in header
  $("#header").append($tr);

  // Add rows with questions for each category
  // empty alll ready contain body
  $("#body").empty();
  for (let clueIndex = 0; clueIndex < 5; clueIndex++) {
    let $tr = $("<tr>");
    for (let catIndex = 0; catIndex < 6; catIndex++) {
      // append td in the tr
      $tr.append(
        `<td id= "${catIndex}-${clueIndex}">
                <i class="fas fa-question-circle fa-3x"></i>
            </td>`
      );
    }
    //   append row in body
    $("#body").append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  // get the target cell
  let cell = $(evt.target);
  //   get the id of target sell
  let id = cell.attr("id");
  //   split id to search in categories
  let [catId, clueId] = id.split("-");
  //   search for clue
  let clue = categories[catId].clues[clueId];

  let msg;
  // if clue not showing
  if (!clue.showing) {
    $(`#${evt.target.id}`).removeClass("initial");
    $(`#${evt.target.id}`).removeClass("green");
    $(`#${evt.target.id}`).addClass("clue");
    // add question in message and update the message of clue
    msg = clue.question;
    clue.showing = "question";
    // if clue showing is question
  } else if (clue.showing === "question") {
    $(`#${evt.target.id}`).removeClass("clue");
    $(`#${evt.target.id}`).removeClass("hover");
    $(`#${evt.target.id}`).addClass("answer");
    $(`#${evt.target.id}`).addClass("green");
    // update ansewr and showing
    msg = clue.answer;
    clue.showing = "answer";
  } else {
    // already showing answer; ignore
    return;
  }

  // Update text of cell
  cell.html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  // clear the board
  $("#header").empty();
  $("#body").empty();

  // show the loading icon
  $("#spin-container").show();
  $("#start").addClass("disabled").text("Loading...");
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#start").removeClass("disabled").text("Restart!");
  $("#spin-container").hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let isLoading = $("#start").text() === "Loading...";

  if (!isLoading) {
    // show loader
    showLoadingView();

    let ids = await getCategoryIds();

    // initialize categories
    categories = [];

    for (let catId of ids) {
      // get category details and push in list
      categories.push(await getCategory(catId));
    }
    // fill table
    await fillTable();
  }
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */

// TODO
// on init put html in the table
function init_html(container) {
  $(container).prepend(`
  <header>
    <h1>Jeopardy!</h1>
    <button id="start">Start!</button>
  </header>

  <div id="spin-container">
    <i class="fa fa-spin fa-spinner"></i>
  </div>

  <table id="jeopardy">
    <thead id="header"></thead>
    <tbody id="body"></tbody>
  </table>
  `);

  /** On click of start / restart button, set up game. */
  $("#start").on("click", setupAndStart);

  /** On page load, add event handler for clicking clues */
  $("#jeopardy").on("click", "tbody td", handleClick); //set the question cell click event
}
//start the game when page load
init_html($("body"));
