# xo
Tic-tac-toe

XO is the implementation of tic-tac-toe in a large field. The application implements authorization based on OAuth2, as well as the ability multi-rooms. Based on this implementation, you can easily create any other game in which there are rooms with any number of players in it.

The application is deployed here: <a href="http://xo.munlightshadow.ru">xo.munlightshadow.ru</a>

The application is divided into 2 parts: server and client.

The client part is implemented on angular2 using typescript. The user, the room and the server are used services.
The user service provides work with tokens, as well as basic methods for providing user data to the rest of the application.
The socket service works using rxjs and provides communication with the server.
The service room contains information about the room in which the game is played, and the socket on which the connection is made.
Before you start the game you need to authenticate, and create or join the created game. Redirect from one page to another occur using routers. Authorization is implemented on the basis of OAuth2.

The server part is implemented on the nodejs. Data transfer uses the webSocket protocol. The roomdata package is used to store data about the game in a particular room.