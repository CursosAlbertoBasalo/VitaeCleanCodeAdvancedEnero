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

- 🗞️ VirginPlanetary added to SpaceY and GreenOrigin as a new operator

### 2.2.1 Open/Close Principle

> `Operators`: Favor add code, not change code

### 2.2.2 Liskov substitution principle

> `Operators`: Beware of inheritance

### 2.2.3 Interface segregation principle

> `Operators`: Depend on abstraction not implementation
> 💡 Improvement: create (short) interfaces to every class

## Lesson 2.3 : Dependency Inversion Principle

### 2.3.1 Dependency Inversion Principle

> `Notifications` High level modules should not depend on low level modules

---

# Session 3 : Design Patterns

## Lesson 3.1 : Creational Patterns

### 3.1.1 Factory

> `BookingsLogic`: create Email Sender instance based on configuration

### 3.1.2 Builder

> `Notifications`: Create and call a class method that builds the email object

## Lesson 3.2 : Structural Patterns

### 3.2.1 Facade

> `Bookings`: keep a single public API for booking operations hiding the rest of the system
> 💬 Discussion: Is cancel an outer method?

### 3.2.2 Adapter or Bridge ❓

> **To Do**

> `Payments`: Adapt After or Bridge Before
> 💬 Discussion: What happens if we change the payment gateway provider?

## Lesson 3.3 : Behavioral Patterns

### 3.3.1 Strategy

> `Operators`: Change behavior on runtime based on operatorId
> 💡 tip: uses a factory
> 💡 Improvement: what if we want allow other payments methods?

### 3.3.2 Command

> **To Do**

> `Bookings-Facade`: execute bookings commands based on name...

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
