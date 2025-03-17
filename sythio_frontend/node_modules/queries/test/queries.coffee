should = require('chai').should()
_ = require('../src/queries')

describe 'queries', () ->
  describe '#move', () ->
    it 'Renames an object field', () ->
      obj1 =
        one: 'hi'
        two: 'bye'
        animal:
          cow: 'moo'
      showEql =
        one: 'hi'
        two: 'bye'
        cat: 'moo'
        animal: {}
      _.move(obj1, 'animal.cow', 'cat').should.eql(showEql)

  describe '#rename', () ->
    it 'Renames props of an object based on another.', () ->
      source =
        itch: 'yes'
        knee: 'no'
        sun: 'sure'
        she: 'always'
      rename_obj =
        knee: 'toe'
        sun: 'moon'
      should_eql =
        itch: 'yes'
        toe: 'no'
        moon: 'sure'
        she: 'always'
      _.rename(source, rename_obj).should.eql(should_eql)

  describe '#pluck', () ->
    source_obj =
      itch: 'yes'
      knee: 'no'
      sun: 'sure'
      she: 'always'
      other:
        deep: 'kiss'
        act: 'lick'
    source2 = [
      {name: 'kai', role: 'ceo'}
      {name: 'bob', role: 'cfo'}
    ]
    it 'Does the same thing as lodash. Return single field when pluck is a string.', () ->
      _.pluck(source_obj, 'other.deep').should.equal('kiss')

    it 'Returns array of strings when pluck is a string.', () ->
      _.pluck(source2, 'role').should.eql(['ceo', 'cfo'])

    it 'Allows you to pick more than one field.', () ->
      _.pluck(source_obj, ['knee', 'sun']).should.eql {knee:'no',sun:'sure'}

    it 'Pluck and rename at the same time.', () ->
      _.pluck(source_obj, {toe: 'other.act'}).should.eql {toe:'lick'}

    it 'Works with arrays of items the same as it does for a single object.', () ->
      _.pluck([source_obj, source_obj], ['knee', 'sun']).should.eql [{knee:'no',sun:'sure'},{knee:'no',sun:'sure'}]

  describe '#clean', () ->
    ugly_obj =
      descriptions: ['', 'sam']
      meta: ['', '', '']
      empty_str: ''
      empty_arr: []
      empty_obj: {}
      false_val: false
      true_val: true
      null_val: null
    clean_obj =
      descriptions: ugly_obj.descriptions
      false_val: false
      true_val: true

    it 'Cleans up an object of fields', () ->
      _.clean(ugly_obj).should.eql clean_obj

  describe '#without', () ->
    item =
      bunch: 'oh'
      fields: 'yup'
      more: 'yes'

    it 'Removes object field/props based on array.', () ->
      item_obj = _.clone item
      _.without(item_obj, ['fields', 'more']).should.eql({bunch:'oh'})

    it 'Removes object field/props based on string.', () ->
      item_obj = _.clone item
      _.without(item_obj, 'fields').should.eql({bunch:'oh', more:'yes'})

    it 'Removes props on an array of objects.', () ->
      items = [item, item, item]
      _.without(items, ['fields', 'more']).should.eql([{bunch:'oh'},{bunch:'oh'},{bunch:'oh'}])
