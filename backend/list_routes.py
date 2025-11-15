from app import app

print("Loaded from:", app.import_name)
print("Routes:")
for rule in app.url_map.iter_rules():
    print(rule.rule)
