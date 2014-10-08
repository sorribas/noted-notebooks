var root = require('root');
var session = require('noted-session');
var getdb = require('noted-db');
var seaport = require('seaport');
var param = require('param');
var ports = seaport.connect(param('registry.host'), param('registry.port'));
var app = root();

var templates = {};

app.use('response.session', session.set);
app.use('request.session', session.get);

app.use('request.userId', function() {
  return this.session('user');
});

app.get('/api/notebooks/{id}', function(req, res) {
  var db = getdb(req.userId());
  db.notebooks.findOne({_id: db.ObjectId(req.params.id)}, function(err, notebook) {
    if (err) return res.error(500, err.toString());
    res.send(notebook);
  });
});

app.get('/api/notebooks', function(req, res) {
  var db = getdb(req.userId());
  db.notebooks.find().sort({name: 1}, function(err, notebooks) {
    if (err) return res.error(500, err.toString());
    res.send(notebooks);
  });
});

app.put('/api/notebooks/{id}', function(req, res) {
  var db = getdb(req.userId());
  req.on('json', function(notebook) {
    notebook._id = db.ObjectId(req.params.id);

    db.notebooks.save(notebook, function(err, notebook) {
      if (err) return res.error(500, err.toString());
      res.send(notebook);
    });
  });
});

app.post('/api/notebooks', function(req, res) {
  var db = getdb(req.userId());
  req.on('json', function(form) {
    var notebook = {
      name: form.name,
    };
    db.notebooks.insert(notebook, function(err, doc) {
      if (err) return res.error(500, err.toString());
      res.send(doc);
    });
  });
});

app.del('/api/notebooks/{id}', function(req, res) {
  var db = getdb(req.userId());
  db.notebooks.remove({_id: db.ObjectId(req.params.id)}, function(err) {
    if (err) return res.error(500, err.toString());
    res.send({ok: true});
  });
});

var port = ports.register('api/notebooks');
app.listen(port);
console.log('NotEd Notebook API server listening on port ' + port);
