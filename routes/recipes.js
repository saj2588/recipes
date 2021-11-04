const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Recipe = require('../models/Recipe')

// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('recipes/add')
})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Recipe.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('recipes/index', {
      recipes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id).populate('user').lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user._id != req.user.id && recipe.status == 'private') {
      res.render('error/404')
    } else {
      res.render('recipes/show', {
        recipe,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
    }).lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
      res.redirect('/recipes')
    } else {
      res.render('recipes/edit', {
        recipe,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id).lean()

    if (!recipe) {
      return res.render('error/404')
    }

    if (recipe.user != req.user.id) {
      res.redirect('/recipes')
    } else {
      recipe = await Recipe.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {

  try {
    await Recipe.remove({ _id: req.params.id })
    res.redirect('/dashboard')
  }
  catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})
//   try {
//     let recipe = await Recipe.findById(req.params.id).lean()

//     if (!recipe) {
//       return res.render('error/404')
//     }

//     if (re.user != req.user.id) {
//       res.redirect('/recipes')
//     } else {
//       await Recipe.remove({ _id: req.params.id })
//       res.redirect('/dashboard')
//     }
//   } catch (err) {
//     console.error(err)
//     return res.render('error/500')
//   }
// })

// @desc    User recipes
// @route   GET /recipes/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const recipes = await Recipe.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('recipes/index', {
      recipes,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
