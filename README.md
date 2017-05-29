# xo
Tic-tac-toe

XO is the implementation of tic-tac-toe in a large field. The application implements authorization based on OAuth2, as well as the ability multi-rooms. Based on this implementation, you can easily create any other game having rooms with any number of players in it.

The application is deployed here: xo.munlightshadow.ru

The application is divided into 2 parts: server and client.

The client part is implemented on angular2 using typescript. The user, the room and the server use services.
The user service provides work with tokens, as well as basic methods for providing user data to the rest of the application.
The socket service works using RxJS and provides communication with the server.
The service room contains information about the room in which the game is played, and the socket on which the connection is made.
Before you start the game you need to login, and create or join the created game. Redirect from one page to another occur using routers. Authorization is implemented on the basis of OAuth2.

The server part is implemented on the Node.js. Data transfer uses the webSocket protocol. The roomdata package is used to store data about the game in a particular room.