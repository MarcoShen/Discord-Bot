module.exports = {
    name: 'neko',
    description: "nekomimi c:",
    execute(message, args){
        number = 410;

        if(args.length == 0){
            imageNumber = Math.floor (Math.random()*(number - 1 + 1))+1;
            message.channel.send( {files: ["E:/Pictures/homework/" + imageNumber + ".JPG"]});      

        }else if(args.length == 1 && !isNaN(args[0])){
            counter = parseInt(args[0]);
            for(i=0; i<counter; i++){
                imageNumber = Math.floor (Math.random()*(number - 1 + 1))+1;
                message.channel.send( {files: ["E:/Pictures/homework/" + imageNumber + ".JPG"]});
            }
                    
        }else{
            message.channel.send("smh, can't even use a simple command");
        }
    }
}