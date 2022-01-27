# Session 1 : Principles of Software Design

## Lesson 1.1 : YAGNI, KISS, DRY

## Lesson 1.2 : Obstacles for change

## Lesson 1.3 : Metrics, preventers and facilitators

### 1.3.1 Reduce afferent (dependents) and efferent (dependencies) coupling

> `Payment`: 4 afferent dependents (not that many)

> `Bookings`: 8 efferent dependencies:

### 1.3.2 Feature envy

> `Notifications.buildBody()`: abuses emailComposer

### 1.3.3 Inappropriate intimacy

> `Notifications.buildBody()`: know how call (order...) the methods

### 1.3.4 Primitive obsession

> `Trips.assertDateRange` and `Bookings.calculatePrice` : use a Range class with invariants and logic

> 💡 Improvement: Create structures for method arguments

### 1.3.5 Reduce calls Tell Don`t Ask

> `Bookings.pay`: move to one method on `Payment`:

### 1.3.6 Reduce knowledge with Law of Demeter

> `Bookings.pay`: dealing with response object implies knowledge od deep dependencies

### 1.3.7 Command-Query segregation

> `Payments.refundBooking`: is a command, not a query... related to TDA

> 💬 Discussion: What about database Ids and create or post methods?

---

# Session 2 : SOLID Principles

## Lesson 2.1 : Single Responsibility Principle

### 2.1.1 Single responsibility

> `Bookings`: Long class with several responsibilities and level of abstraction
> 💡 Improvement: apply to every class

## Lesson 2.2 : OLI principles

🗞️ VirginPlanetary added to SpaceY and GreenOrigin as a new operator

### 2.1.2 Open/Close Principle

> `Operators`: Favor add code, not change code

### 2.1.3 Liskov substitution principle

> `Operators`: Beware of inheritance

### 2.1.4 Interface segregation principle

> `Operators`: Depend on abstraction not implementation

## Lesson 2.3 : Dependency Inversion Principle

### 2.1.5 Dependency Inversion Principle

> `Notifications` High level modules should not depend on low level modules

---

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

---

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
