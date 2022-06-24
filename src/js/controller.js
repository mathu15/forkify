import * as model from './model.js';
import { MODEL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
if (module.hot) {
  module.hot.accept();
}
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0. update resultsView to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //3.update bokkmarksview//1
    //debugger;
    bookmarksView.update(model.state.bookmarks);
    //1.loading recipe//2
    await model.loadRecipe(id);
    //const { recipe } = model.state;

    //2.rendering recipe//3
    recipeView.render(model.state.recipe);
  } catch (err) {
    // alert(err);
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1. get query
    const query = searchView.getQuery();
    if (!query) return;

    //2.load search results
    await model.loadSearchResults(query);

    //3.render results
    //resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //4. render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //3.render NEW results
  //resultsView.render(model.state.search.results);
  resultsView.render(model.getSearchResultsPage(goToPage));

  //4. render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings(in state)
  model.updateServings(newServings);
  //2.rendering recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2.update recipe View
  recipeView.update(model.state.recipe);

  //3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show loading spinner
    addRecipeView.renderSpinner();

    //upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    //change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //window.history.back();

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const newFeature = function () {
  console.log('Welcome to the application!');
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
