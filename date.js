
exports.getDate = function(){
    
    var options = {weekday:"long", month:"long", day:"numeric"}
    var today = new Date();
    var currentDay = today.toLocaleDateString('en-US', options)
    return currentDay
}

exports.getDay = function(){
    
    var options = {weekday:"long"}
    var today = new Date()
    var currentDay = today.toLocaleDateString('en-US', options)
    return currentDay
}
   
