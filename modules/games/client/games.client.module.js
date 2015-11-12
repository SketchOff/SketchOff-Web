'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('games');
ApplicationConfiguration.registerModule('games.admin', ['core.admin']);
ApplicationConfiguration.registerModule('games.admin.routes', ['core.admin.routes']);
