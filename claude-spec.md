create webapplication called agentic operation system (goagenticos.com)
**purpose** : providing user interface to business users to write specifications for claude to build software
**requirements**
- requirements are generally written in Gherkin format (Given , Then, When)
- user can create domains and define attributes to the domains 
- domain attributes can be invocked inside requirements given, then, when 
- user interface is given to build requirements
- data can be imported to data bags
- data can be linked to requirements for test data
- there should be a way user can design test-cases part of the requirements
- it should be visually available for users to see the simulation of the requirements
- users can choose which claude model to generate software specification
- user can create a project or projects to save into vercel storage where specifications are stored
- user can edit the requirements and specs are updated automatics
**technical implementation**
- front end is JavaScript with Visual Flows 
- back end is Rust invoked via REST 
- storage is in Vercel 

