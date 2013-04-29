describe 'Klass of basic OOP feture provider', ->
  klass = Elastic.klass
  Human = null

  beforeEach ->
    Human = klass.of
      constructor: (age, gender)->
        @age = age
        @gender = gender
      age: null
      gender: null
      say: ->
        'Hello'

  it 'can create new Class', ->
    john = new Human(27, 'male')

    expect(john.age).toBe(27)
    expect(john.gender).toBe('male')
    expect(john.say()).toBe('Hello')

    nancy = Human.create(24, 'female')
    expect(nancy.age).toBe(24)
    expect(nancy.gender).toBe('female')
    expect(nancy.say()).toBe('Hello')

  it 'can create new Class extends exsting Class', ->
    SuperMan = Human.extends
      beam: 'Beeeaaam!!'
      say: ->
        'Super! ' + @beam

    UltraMan = SuperMan.extends

      say: ->
        'Ultra! ' + @beam

    human    = new Human(20, 'male')
    superman = new SuperMan(20, 'female')
    ultraman = new UltraMan(40, 'unknown')

    expect(human.say()).toBe('Hello')
    expect(superman.say()).toBe('Super! '+superman.beam)
    expect(ultraman.say()).toBe('Ultra! '+ultraman.beam)

  it 'created class can mixin trait', ->
    BatWing =
      fly: ->
        'I can fly!'
      speed: 3000

    Batman = Human.extends(
      say: ->
        'Batman!'
      speed: 30
    ).with(BatWing, {fly: 'batmanFly'})

    bruce = new Batman(39, 'male')

    expect(bruce.say()).toBe('Batman!')
    expect(bruce.batmanFly()).toBe('I can fly!')
    expect(bruce.speed).toBe(3000)
    expect(Batman.speed).toBeUndefined()

  it 'created sub class can call super class method', ->
    HelloMan = Human.extends
      say: ->
        @super('say', arguments) + ' World'
      god: (ohmy)->
        ohmy + ' God'

    JesusMan = HelloMan.extends
      say: ->
        @super 'say', arguments
      god: ->
        @super 'god', arguments

    believer = new JesusMan(54, 'male')
    expect(believer.god('Oh my')).toBe('Oh my God')
    # TODO: 2段以上のsuperの呼び出し連鎖が成立しない... this基準以外で親クラスへの参照をもたないとムリぽ
#    expect(believer.say()).toBe('Hello World')
