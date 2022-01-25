# Session 1 : Principles of Software Design

## Lesson 1.1 : YAGNI, KISS, DRY

## Lesson 1.2 : Obstacles for change

## Lesson 1.3 : Metrics, preventers and facilitators

- Reduce afferent (dependents) and efferent (dependencies) coupling

> `Payment`: 4 afferent dependents (not that many)

> `Bookings`: 8 efferent dependencies:

- Feature envy

> ?

- Inappropriate intimacy

> ?

- Primitive obsession

> `Trips.assertDateRange` and `Bookings.calculatePrice` : use a Range class with invariants and logic

- Reduce calls Tell Don`t Ask

> `Bookings.pay`: move to one method on `Payment`:

- Reduce knowledge with Law of Demeter

> `Bookings.notify`: don`t use emailComposer and.. TDA

- Command-Query separation

> `Payments.refundBooking`: is a command, not a query... related to TDA

> 💬 Discussion: What about database Ids and create or post methods?

# Session 2 : SOLID Principles

## Lesson 2.1 : Single Responsibility Principle

- One class responsible for one thing

## Lesson 2.2 : OLI principles

- Open for extension, closed for modification

- Liskov substitution principle

- Interface segregation principle

## Lesson 2.3 : Dependency Inversion Principle

- High level modules should not depend on low level modules

# Session 3 : Design Patterns

## Lesson 3.1 : Creational Patterns

- Factory

- Builder

- Singleton

## Lesson 3.2 : Structural Patterns

- Adapter

- Facade

## Lesson 3.3 : Behavioral Patterns

- Strategy

- Command

# Session 4 : Software Architecture

## Lesson 4.1 : Layered Architecture

- Application

- Domain

- Infrastructure

## Lesson 4.2 : Domain Driven Design

- Domain is king

- Ports to abstraction

- Adapters to implementation

## Lesson 4.3 : CQRS Architecture

- Command flow

- Query flow
