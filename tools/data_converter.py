
"""
Data Converter Module
Handles conversion between JSON, XML, CSV, and YAML formats.
"""

import json
import csv
import io
import xml.etree.ElementTree as ET
from typing import Dict, Any, Union, List

# Check for optional dependencies
try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False

try:
    import xmltodict
    XMLTODICT_AVAILABLE = True
except ImportError:
    XMLTODICT_AVAILABLE = False

def is_valid_json(data: str) -> bool:
    try:
        json.loads(data)
        return True
    except ValueError:
        return False

def is_valid_xml(data: str) -> bool:
    try:
        ET.fromstring(data)
        return True
    except ET.ParseError:
        return False

def parse_input(data: str, format: str) -> Any:
    """Parse string input into Python object"""
    if format == 'json':
        return json.loads(data)
    
    elif format == 'xml':
        if XMLTODICT_AVAILABLE:
            # force_list on specific duplicate keys if needed, but default is usually fine for general viewer
            return xmltodict.parse(data)
        else:
            # Fallback simple parser (limited)
            root = ET.fromstring(data)
            return _element_to_dict(root)
            
    elif format == 'yaml':
        if YAML_AVAILABLE:
            return yaml.safe_load(data)
        else:
            raise ImportError("PyYAML is not installed. Please install 'PyYAML' to use YAML features.")
            
    elif format == 'csv':
        # CSV to List of Dicts
        f = io.StringIO(data)
        reader = csv.DictReader(f)
        return list(reader)
        
    raise ValueError(f"Unsupported input format: {format}")

def format_output(data: Any, format: str) -> str:
    """Format Python object into string output"""
    if format == 'json':
        return json.dumps(data, indent=2)
    
    elif format == 'xml':
        if XMLTODICT_AVAILABLE:
            # We need a root element if it's a list or doesn't have a single root
            if isinstance(data, list):
                data = {'root': {'item': data}}
            elif len(data.keys()) > 1:
                data = {'root': data}
            return xmltodict.unparse(data, pretty=True)
        else:
             # Very basic fallback
            if isinstance(data, dict) and len(data) == 1:
                root_name = list(data.keys())[0]
                root = _dict_to_element(root_name, data[root_name])
            else:
                root = _dict_to_element('root', data)
            
            # Rough pretty print
            xml_str = ET.tostring(root, encoding='unicode')
            return xml_str
            
    elif format == 'yaml':
        if YAML_AVAILABLE:
            return yaml.dump(data, sort_keys=False)
        else:
             raise ImportError("PyYAML is not installed.")
             
    elif format == 'csv':
        # List of Dicts to CSV
        if isinstance(data, dict):
            # Try to find a list inside
            for key, val in data.items():
                if isinstance(val, list):
                    data = val
                    break
        
        if not isinstance(data, list):
             # Try to wrap it
             data = [data]
             
        if not data:
            return ""
            
        # Collect all headers
        headers = set()
        for item in data:
            if isinstance(item, dict):
                headers.update(item.keys())
        
        headers = sorted(list(headers))
        
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue()
        
    raise ValueError(f"Unsupported output format: {format}")

def convert_data(content: str, input_fmt: str, output_fmt: str) -> Dict[str, Any]:
    """
    Main conversion function
    Returns: {'success': bool, 'data': str, 'error': str}
    """
    try:
        # 1. Parse Input to Python Object
        py_obj = parse_input(content, input_fmt)
        
        # 2. Convert to Output Format
        output_str = format_output(py_obj, output_fmt)
        
        return {'success': True, 'data': output_str}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

# --- Helpers for ElementTree Fallback ---

def _element_to_dict(element):
    """Recursively convert XML Element to dict"""
    result = {}
    
    # Attributes
    for key, value in element.attrib.items():
        result[f"@{key}"] = value
    
    # Children
    for child in element:
        child_data = _element_to_dict(child)
        if child.tag in result:
            if isinstance(result[child.tag], list):
                result[child.tag].append(child_data)
            else:
                result[child.tag] = [result[child.tag], child_data]
        else:
            result[child.tag] = child_data
            
    # Text
    if element.text and element.text.strip():
        if result:
            result["#text"] = element.text.strip()
        else:
            return element.text.strip()
            
    return result

def _dict_to_element(tag, d):
    """Recursively convert dict to XML Element"""
    elem = ET.Element(tag)
    if isinstance(d, dict):
        for key, val in d.items():
            if key.startswith("@"):
                elem.set(key[1:], str(val))
            elif key == "#text":
                elem.text = str(val)
            else:
                if isinstance(val, list):
                    for item in val:
                        elem.append(_dict_to_element(key, item))
                else:
                    elem.append(_dict_to_element(key, val))
    elif isinstance(d, list):
        # Should not happen if called correctly from parent
        pass 
    else:
        elem.text = str(d)
    return elem
