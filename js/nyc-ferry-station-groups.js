// collection of station id arrays for each city and islands
var nycFerryStationGroups = {
    bronx: ['538'],  
    'staten island': ['537'], 
    manhattan: ['530', '528', '529', '532', '533', '536', '531', '534'],
    'new york': ['530', '528', '529', '532', '533', '536', '531', '534'],
    
    // Governor's island and Roosevel island are lacated in Manhattan. 
    // However, they are separated from Manhattan
    'governors island': ['535'],
    'roosevelt island': ['536'],
    
    brooklyn: ['523', '526', '524', '520', '521', '525', '522'],
    queens: ['516', '518', '517', '519'],
    
    // Rockaway is located in Queens but it is separated from Queens and Brooklyn
    rockaway: ['519'],

    // All NYC ferry station list
    all: ['538', '537', '530', '528', '529', '532', '533', '536', '531', '534', '535', '536', '523', '526', '524', '520', '521', '525', '522', '516', '518', '517', '519', '519']
};

// collection of zipcode array   
var nycFerryStationZipcodeGroups = {  
    'governors island': ['11231'],
    'roosevelt island': ['10044'],
    rockaway: ['11697', '11694', '11693', '11692', '11691', '11414']
};
